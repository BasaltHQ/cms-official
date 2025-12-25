const sdk = require('@zoralabs/protocol-sdk');
console.log('SDK Exports:', Object.keys(sdk));

if (sdk.PremintClient) {
    console.log('PremintClient prototype:', Object.getOwnPropertyNames(sdk.PremintClient.prototype));
}

if (sdk.createCreatorClient) {
    // Mock config to see what it returns? 
    // Probably async or needs valid config.
    // Just checking keys is enough.
}
