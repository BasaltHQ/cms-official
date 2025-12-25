import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Verify this path
import { prismadb } from "@/lib/prisma";
import { PinataSDK } from "pinata-web3";
// import { createCreatorClient } from "@zoralabs/protocol-sdk";
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { title, description, image } = await req.json();

        // 1. Get Keys
        const settings = await prismadb.socialSettings.findFirst();
        const pinataJwt = settings?.pinataJwt;
        const zoraPrivateKey = settings?.zoraPrivateKey;

        if (!pinataJwt || !zoraPrivateKey) {
            return new NextResponse("Missing Zora/Pinata keys", { status: 400 });
        }

        // 2. Initialize Pinata
        const pinata = new PinataSDK({
            pinataJwt: pinataJwt,
            pinataGateway: "gateway.pinata.cloud", // Default
        });

        // 3. Upload Image to IPFS
        // Assuming 'image' is a data URL or a public URL we need to fetch first
        // If it's a base64 data URL:
        let imageBlob: Blob;
        if (image.startsWith("data:")) {
            const res = await fetch(image);
            imageBlob = await res.blob();
        } else {
            // If it's a remote URL from our media library, fetch it
            const res = await fetch(image);
            imageBlob = await res.blob();
        }

        // File styling
        const file = new File([imageBlob], "image.png", { type: "image/png" });
        const uploadImage = await pinata.upload.file(file);
        const imageIpfsUrl = `ipfs://${uploadImage.IpfsHash}`;

        // 4. Create Metadata
        const metadata = {
            name: title || "Cast Mint",
            description: description || "Minted via CMS",
            image: imageIpfsUrl,
            content: { mime: "image/png", uri: imageIpfsUrl } // Farcaster specific structure often helpful
        };

        const uploadMetadata = await pinata.upload.json(metadata);
        const metadataIpfsUrl = `ipfs://${uploadMetadata.IpfsHash}`;

        // 5. Initialize Zora
        // 0 key must be hex
        const account = privateKeyToAccount(zoraPrivateKey as `0x${string}`);

        const walletClient = createWalletClient({
            account,
            chain: base,
            transport: http()
        });

        const publicClient = {
            chain: base,
            readContract: async (args: any) => {
                // Minimal mock since SDK just uses it for simulation/reads
                // But better to use a real public client if possible.
                // For now, let's try to construct a real viem public client?
                // Or just pass the walletClient if it has capabilities?
                // SDK expects Pick<PublicClient, "readContract" | "chain">
                // Let's create a real public client using standard RPC
            }
        };

        // Import createPublicClient from viem to hold read capability
        const viemPublicClient = require("viem").createPublicClient({
            chain: base,
            transport: http()
        });

        const { create1155 } = require("@zoralabs/protocol-sdk");

        // 6. Create 1155 Contract & Token (On-chain)
        // This generates the transaction parameters
        const { request, contractAddress } = await create1155({
            contract: {
                name: title || "Cast Collection",
                uri: metadataIpfsUrl,
            },
            token: {
                tokenURI: metadataIpfsUrl,
                maxSupply: BigInt("18446744073709551615"),
                pricePerToken: parseEther("0.000777"),
                mintStart: BigInt(Math.floor(Date.now() / 1000)),
                royaltyBPS: 500,
                payoutRecipient: account.address,
            },
            account: account.address,
            publicClient: viemPublicClient
        });

        // 7. Execute Transaction
        // SDK returns 'request' which is a SimulateContractReturnType.
        // We can write it directly using walletClient.
        const hash = await walletClient.writeContract(request);

        // Note: In production we might want to wait for receipt, but for speed we return early.
        // The contract address is deterministic so we can return the URL immediately.

        const zoraUrl = `https://zora.co/collect/base:${contractAddress}/1`;

        return NextResponse.json({ url: zoraUrl, collectionAddress: contractAddress, txHash: hash });

    } catch (error: any) {
        console.error("Zora Error:", error);
        return new NextResponse(error.message || "Failed to create mint", { status: 500 });
    }
}
