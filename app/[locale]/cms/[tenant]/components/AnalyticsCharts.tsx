"use client";

import { Card, AreaChart, Title, Text, Metric, Flex, BadgeDelta, Grid, BarList, DonutChart, Legend, Bold } from "@tremor/react";

interface AnalyticsChartsProps {
    chartdata: any[];
    topPages: any[];
    kpiData: any[];
    cities: any[]; // Using mock cities for now as we don't track geo yet
}

export default function AnalyticsCharts({ chartdata, topPages, kpiData, cities }: AnalyticsChartsProps) {
    return (
        <div className="space-y-6">
            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                {kpiData.map((item) => (
                    <Card key={item.title} decoration="top" decorationColor="emerald" className="bg-[#0A0A0B]/60 backdrop-blur-xl ring-1 ring-white/5 shadow-xl border-none">
                        <Text className="text-gray-400">{item.title}</Text>
                        <Flex justifyContent="start" alignItems="baseline" className="truncate space-x-3">
                            <Metric className="text-white">{item.metric}</Metric>
                            <BadgeDelta deltaType={item.deltaType as any}>{item.delta}</BadgeDelta>
                        </Flex>
                        <Flex justifyContent="start" className="space-x-2 mt-4">
                            <Text className="truncate text-gray-500">
                                Previous: <Bold className="text-gray-400">{item.metricPrev}</Bold>
                            </Text>
                        </Flex>
                    </Card>
                ))}
            </Grid>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-[#0A0A0B]/60 backdrop-blur-xl ring-1 ring-white/5 shadow-xl border-none">
                        <Title className="text-white">Traffic Trends</Title>
                        <Text className="text-gray-400">Daily unique visitors & page views</Text>
                        <AreaChart
                            className="h-72 mt-4"
                            data={chartdata}
                            index="date"
                            categories={["Visitors", "Page Views"]}
                            colors={["cyan", "emerald"]}
                            yAxisWidth={40}
                            showAnimation={true}
                        />
                    </Card>

                    <Card className="bg-[#0A0A0B]/60 backdrop-blur-xl ring-1 ring-white/5 shadow-xl border-none">
                        <Title className="text-white">Geographics</Title>
                        <Text className="text-gray-400">Visitors by City</Text>
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
                            <DonutChart
                                data={cities}
                                category="value"
                                index="name"
                                colors={["cyan", "emerald", "indigo", "violet", "fuchsia"]}
                                variant="pie"
                                className="h-40"
                            />
                            <Legend
                                categories={cities.map(c => c.name)}
                                colors={["cyan", "emerald", "indigo", "violet", "fuchsia"]}
                                className="mt-6 sm:mt-0"
                            />
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-[#0A0A0B]/60 backdrop-blur-xl ring-1 ring-white/5 shadow-xl border-none h-full">
                        <Title className="text-white">Top Pages</Title>
                        <Text className="text-gray-400">Most visited URLs this month</Text>
                        <BarList data={topPages} className="mt-4 stroke-emerald-500" color="emerald" />
                    </Card>
                </div>
            </div>
        </div>
    );
}
