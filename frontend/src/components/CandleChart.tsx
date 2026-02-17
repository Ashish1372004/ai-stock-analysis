import React from 'react';
// @ts-ignore
import Chart from 'react-apexcharts';
// @ts-ignore
import { ApexOptions } from 'apexcharts';

interface CandleChartProps {
    data: any[];
}

const CandleChart: React.FC<CandleChartProps> = ({ data }) => {
    const series = [
        {
            data: data.map(item => ({
                x: new Date(item.timestamp),
                y: [item.open, item.high, item.low, item.close]
            }))
        }
    ];

    const options: ApexOptions = {
        chart: {
            type: 'candlestick',
            height: 350,
            background: 'transparent',
            toolbar: {
                show: true,
                autoSelected: 'zoom'
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
            }
        },
        theme: {
            mode: 'dark'
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#94a3b8'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            tooltip: {
                enabled: true
            },
            labels: {
                style: {
                    colors: '#94a3b8'
                },
                formatter: (val: number) => `₹${val.toFixed(2)}`
            }
        },
        grid: {
            borderColor: '#1e293b',
            strokeDashArray: 4,
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#10b981',
                    downward: '#f43f5e'
                }
            }
        },
        tooltip: {
            theme: 'dark'
        }
    };

    return (
        <div className="w-full">
            <Chart
                options={options}
                series={series}
                type="candlestick"
                height={400}
            />
        </div>
    );
};

export default CandleChart;
