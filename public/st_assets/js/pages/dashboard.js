$( document ).ready(function() {
    
    // CounterUp Plugin
    $('.counter').counterUp({
        delay: 10,
        time: 1000
    });
    
 
    var flot1 = function () {
        var data = [[0, 78.68], [1, 76.43], [2, 77.97]];
        var data2 = [[0, 79.27], [1, 75.45], [2, 76.78]];
		var data3 = [[0, 74.4], [1, 76.78]];
        var dataset =  [
            {
                data: data,
                color: "orange",
                lines: {
                    show: true,
                    fill: 0.2,
                },
                shadowSize: 0,
            }, {
                data: data,
                color: "#fff",
                lines: {
                    show: false,
                },
                points: {
                    show: true,
                    fill: true,
                    radius: 4,
                    fillColor: "rgba(0,0,100,1)",
                    lineWidth: 2
                },
                curvedLines: {
                    apply: false,
                },
                shadowSize: 0
            }, {
                data: data2,
                color: "rgba(34,186,160,1)",
                lines: {
                    show: true,
                    fill: 0.2,
                },
                shadowSize: 0,
            },{
                data: data2,
                color: "#fff",
                lines: {
                    show: false,
                },
                curvedLines: {
                    apply: false,
                },
                points: {
                    show: true,
                    fill: true,
                    radius: 4,
                    fillColor: "rgba(34,186,160,1)",
                    lineWidth: 2
                },
                shadowSize: 0
            }, {
                data: data3,
                color: "rgba(255,0,160,1)",
                lines: {
                    show: true,
                    fill: 0.2,
                },
                shadowSize: 0,
            },{
                data: data3,
                color: "#fff",
                lines: {
                    show: false,
                },
                curvedLines: {
                    apply: false,
                },
                points: {
                    show: true,
                    fill: true,
                    radius: 4,
                    fillColor: "rgba(255,0,160,1)",
                    lineWidth: 2
                },
                shadowSize: 0
            }
        ];
        
        var ticks = [[0, "Term1"], [1, "Term2"], [2, "Term3"]];

        var plot1 = $.plot("#flotchart1", dataset, {
            series: {
                color: "#14D1BD",
                lines: {
                    show: true,
                    fill: 0.2
                },
                shadowSize: 0,
                curvedLines: {
                    apply: true,
                    active: true
                }
            },
            xaxis: {
                ticks: ticks,
            },
            legend: {
                show: false
            },
            grid: {
                color: "#AFAFAF",
                hoverable: true,
                borderWidth: 1,
                backgroundColor: '#FFF'
            }
        });
        
    };
    
   // flot1();
    
    $(".live-tile").liveTile();
    
});