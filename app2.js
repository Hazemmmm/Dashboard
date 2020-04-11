var serverReq;
var serverReq1;


////// DDLs ///////
var DDL_continent = document.getElementById("continent");
var DDL_name = document.getElementById("name");
var DDL_ctys = document.getElementById("ctys")
// var DDL_formal_en = document.getElementById("formal_en");


//////// GOOGLE CHARTS ////////////////

google.charts.load('current', { 'packages': ['bar'] });
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.load("current", { 'packages': ["corechart"] });

google.charts.load('current', { 'packages': ['corechart'] });



require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Home",
    "esri/widgets/Locate",
    "esri/renderers/ClassBreaksRenderer",
    "esri/widgets/LayerList",
    "esri/widgets/Compass",
    "esri/request",
    // "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/geometry/Extent",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "dojo/domReady!"
], function (Map, MapView, FeatureLayer, Home, Locate, ClassBreaksRenderer, LayerList, Compass, request, QueryTask, Query, Extent, Graphic, GraphicsLayer) {


    var popup = {

        title: "{continent}",
        content: "{name} , {formal_en}"
    }

    var layer = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Countries_Natural_Earth_1_50M/FeatureServer/0",

        popupTemplate: popup
    });


    var city = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/World_Countries_Cities/FeatureServer/1"
    });

    var graphicLayer = new GraphicsLayer();


    var myMap = new Map({

        basemap: "streets-night-vector",
        layers: [layer, city]
    });


    var view = new MapView({
        map: myMap,
        container: "mymap",
        center: [10, 32],
        zoom: 1
    });

    var home = new Home({

        view: view,

    })

    view.ui.add(home,
        {
            position: "top-left"

        }
    );

    var locateBtn = new Locate({
        view: view
    });
    view.ui.add(locateBtn,
        {
            position: "top-left"

        }
    );

    var compass = new Compass({
        view: view
    });
    view.ui.add(compass,
        {
            position:
                "top-left"
        }
    );



    ///////////////////////// REQUIRE for LAYERS //////////////////////////////

    var layerurl = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Countries_Natural_Earth_1_50M/FeatureServer/0/query"

    var reqOptions = {
        responseType: "json",

        query: {

            where: "pop_est >100000",
            // f format
            f: "json",
            // like select in sql
            outFields: "continent,name,pop_est,pop_year"
        }
    }

    var layerurl1 = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/World_Countries_Cities/FeatureServer/1/query"

    var reqOptions1 = {
        responseType: "json",

        query: {

            where: "POP > 0",
            // f format
            f: "json",
            // like select in sql
            outFields: "CNTRY_NAME,CITY_NAME,POP,STATUS"
        }
    }


    request(layerurl, reqOptions).then(function (response) {

        serverReq = response.data;
        // console.log(serverReq);


        let continent_name = []

        for (let i = 0; i < response.data.features.length; i++) {
            if (!continent_name.includes(response.data.features[i].attributes.continent)) {
                continent_name.push(response.data.features[i].attributes.continent)

                let opt = document.createElement('option');
                opt.textContent = response.data.features[i].attributes.continent
                opt.value = response.data.features[i].attributes.continent


                DDL_continent.appendChild(opt)
            }

        }
        // console.log(continent_name)

        request(layerurl1, reqOptions1).then(function (response) {
            console.log(response.data)
            serverReq1 = response.data;

            let city_name = [];
            for (let i = 0; i < response.data.features.length; i++) {
                if (!city_name.includes(response.data.features[i].attributes.CITY_NAME)) {
                    continent.push(response.data.features[i].attributes.CITY_NAME)

                    let opt = document.createElement('option');
                    opt.textContent = response.data.features[i].attributes.CITY_NAME
                    opt.value = response.data.features[i].attributes.CITY_NAME

                    DDL_ctys.appendChild(opt)
                }
            }

        })

    }).catch(err => console.log(err))



    ////////////////////////// DROP DOWN LISTS ////////////////////////////////////

    DDL_continent.addEventListener("change", function () {
        // console.log(serverReq)
        const continent_name = serverReq.features.filter(one => {
            return one.attributes.continent == this.value
        })
        // console.log(country_name)

        while (DDL_name.firstChild) {
            DDL_name.removeChild(DDL_name.firstChild)
        }

        let optt = document.createElement('option');
        optt.textContent = "All"
        optt.value = "All"
        DDL_name.appendChild(optt)

        for (let i = 0; i < continent_name.length; i++) {

            let opt = document.createElement('option');
            opt.textContent = continent_name[i].attributes.name
            opt.value = continent_name[i].attributes.name

            DDL_name.appendChild(opt)
        }

        if (this.value != "All") {
            layer.definitionExpression = "continent = '" + this.value + "'"
            console.log(this.value)
        }
        else {
            layer.definitionExpression = "name = '" + this.value + "'"
            home.go()
        }
        chartPop(this.value);
        drawChart(this.value);


        var queryRequest = new QueryTask({
            url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Countries_Natural_Earth_1_50M/FeatureServer/0/query"

        });

        var query = new Query();
        query.where = "continent = '" + continent_name[0].attributes.continent + "' ";

        queryRequest.executeForExtent(query).then(function (extent) {

            console.log(extent);

            view.goTo(
                {
                    extent: extent.extent
                }

            ), { duration: 8000 }

        })
        console.log(name)

    })

    ////////////////////// EXTENT TO LAYERS ///////////////////////////

    DDL_name.addEventListener("change", function () {
        var country = serverReq.features.filter(fea => fea.attributes.name == this.value)
        console.log(country)

        if (this.value != "All") {
            layer.definitionExpression = "name = '" + this.value + "'"
        }
        else {
            layer.definitionExpression = "continent = '" + DDL_continent.value + "'"
            home.go();
        }
        // console.log(country)

        var queryRequest = new QueryTask({
            url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Countries_Natural_Earth_1_50M/FeatureServer/0/query"
        });

        var query = new Query();
        query.where = "name = '" + country[0].attributes.name + "'"
        queryRequest.executeForExtent(query).then(function (extent) {
            console.log(extent);

            view.goTo(
                {
                    extent: extent.extent
                }
            ), { duration: 8000 }
        })


    })



    DDL_name.addEventListener("change", function () {

        // console.log(serverReq1)
        const CITY_NAME = serverReq1.features.filter(one => {
            return one.attributes.CNTRY_NAME == this.value
        })

        // console.log(country_name)

        // debugger;
        while (DDL_ctys.firstChild) {
            DDL_ctys.removeChild(DDL_ctys.firstChild)

        }

        let optt = document.createElement('option');
        optt.textContent = "All"
        optt.value = "All"
        DDL_ctys.appendChild(optt)

        for (let i = 0; i < CITY_NAME.length; i++) {

            let opt = document.createElement('option');
            opt.textContent = CITY_NAME[i].attributes.CITY_NAME
            opt.value = CITY_NAME[i].attributes.CITY_NAME

            DDL_ctys.appendChild(opt)
        }

        if (this.value != "All") {
            layer.definitionExpression = "name = '" + this.value + "'"
            city.definitionExpression = "CNTRY_NAME = '" + this.value + "'"

            // console.log(this.value)
        }
        else {
            layer.definitionExpression = ""
            city.definitionExpression = ""
            home.go();

            // console.log(DDL_continent.value)
        }
        chart.clearChart();
        // chart4.clearChart();
        dChart(this.value);
        chartX(this.value);

    })

    // chart.clearChart();
    // drawChart(this.value);



    DDL_ctys.addEventListener("change", function () {
        var city = serverReq1.features.filter(fea => {
            return fea.attributes.CITY_NAME == this.value
        }
        );

        view.goTo(
            {
                center: [city[0].geometry.x, city[0].geometry.y],
                zoom: 8

            }
        ), { duration: 8000 }

        console.log(city)

        graphicLayer.removeAll();
        var point = {
            type: "point",  // autocasts as new Point()
            x: city[0].geometry.x,
            y: city[0].geometry.y
        };

        var markerSymbol = {
            type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
            color: [226, 119, 40]
        };

        var pointGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol
        });

        graphicLayer.add(pointGraphic)

        myMap.add(graphicLayer)

        console.log(this.value)

        chart2.clearChart();
        draw(this.value);

    });




    /////////////////////////////////////////// CHARTS ////////////////////////////////////////

    function chartPop(countryName) {
        const country_name = serverReq.features.filter(fea => {
            return fea.attributes.continent == countryName
        })

        // console.log(country_name)

         data = google.visualization.arrayToDataTable([
            ['continent', 'name'],
            [country_name[0].attributes.continent, country_name[0].attributes.name],
        ]);


        for (let i = 1; i < country_name.length; i++) {
            data.addRows([
                [country_name[i].attributes.continent, country_name[i].attributes.name]
            ]);
        }

         options = {
            title: "Every Continent has a several countries",

            width: 400,
            height: 190,
            bar: { groupWidth: "95%" },
            legend: { position: "none" },
        };

        chart = new google.charts.Bar(document.getElementById('chart'));
        chart.draw(data, options);
    }


    function drawChart(t) {
        const cnries = serverReq.features.filter(fea => {
            console.log(fea.attributes.continent == t)
            return fea.attributes.continent == t
        })

        //        console.log(country_name)
        var data1 = google.visualization.arrayToDataTable([
            ['Country', 'POP'],
            [cnries[0].attributes.continent, cnries[0].attributes.name],
        ]);



        for (let i = 1; i < cnries.length; i++) {
            data1.addRows([
                [cnries[i].attributes.continent, cnries[i].attributes.name]
            ]);
        }

        var options1 = {
            title: "countries for each continent",
            is3D: true,
            width: 400,
            height: 195

        };

        var chart1 = new google.visualization.PieChart(document.getElementById('piechart_3d'));
        chart1.draw(data1, options1);
    }




    function dChart(e) {
        const d = serverReq1.features.filter(fea => fea.attributes.CNTRY_NAME == e)
       

         data2 = google.visualization.arrayToDataTable([
            ['Country', 'POP', { role: "style" }],
            [d[0].attributes.CITY_NAME, d[0].attributes.POP, "#b87333"],
        ]);

        for (let i = 1; i < d.length; i++) {
            data2.addRows([
                [d[i].attributes.CITY_NAME, d[i].attributes.POP, "#b87333"]
            ]);

             options2 = {
                title: 'Cities population',
                is3D: true,
                width: 400,
                height: 195,
            };

             chart2 = new google.visualization.PieChart(document.getElementById('chart'));
            chart2.draw(data2, options2);
        }
    }



    function chartX(r) {
        const CITIES = serverReq1.features.filter(fea => fea.attributes.CNTRY_NAME == r)
        console.log(CITIES)

         data3 = google.visualization.arrayToDataTable([
            ['City', 'POP', { role: "style" }],
            [CITIES[0].attributes.CITY_NAME, CITIES[0].attributes.POP, "#b87333"]
        ]);

        for (let i = 1; i < CITIES.length; i++) {
            data3.addRows([
                [CITIES[i].attributes.CITY_NAME, CITIES[i].attributes.POP, "#b87333"]
            ]);
        }
         options3 = {
            title: "the population in every city",
            colors: ['red', 'black', 'blue'],
            width: 400,
            height: 195,
            bar: { groupWidth: "95%" },
            legend: { position: "none" },
            bubble: { textStyle: { fontSize: 11 } }
        };
         chart3 = new google.visualization.PieChart(document.getElementById("piechart_3d"));
        chart3.draw(data3, options3);
    }



    function draw(hazem) {
        const e = serverReq1.features.filter(fea => {
            console.log(fea.attributes.continent == hazem)
            return fea.attributes.continent == hazem
        })

        console.log(e)


         data4 = google.visualization.arrayToDataTable([
            ['continent ', 'POP_RANK ', { role: "style" }],
            [e[0].attributes.continent, e[0].attributes.POP_RANK, "#b87333"]
        ])
        for (let i = 1; i < e.length; i++) {
            data4.addRows([
                [e[i].attributes.continent, e[i].attributes.POP_RANK, "#b87333"]
            ]);
        }
        options4 = {
            title: "the status of the city",
            vAxis: { title: 'status' },
            colors: ['red', 'black', 'blue'],
            width: 400,
            height: 195,
            isStacked: true

        };
        chart4 = new google.visualization.PieChart(document.getElementById("chart"));
        chart4.draw(data4, options4);

    }


    // function x() {
    //     chart.clearChart();
    //     chart1.clearChart();
    //     dChart();
    // }


});





