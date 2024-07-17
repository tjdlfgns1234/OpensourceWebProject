const map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(36.6273, 127.4987),
    zoom: 8,
});

// create map format
const exitbutton = `<button id="btn-exit" class="" type="button" id="button-addon2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                        </svg>
                    </button>`;

function createMap() {
    $.ajax({   // 코로나 API 요청
        type: "GET", // GET 방식으로 요청한다.
        url: `https://api.corona-19.kr/korea/?serviceKey=`,
        data: {}, // 요청하면서 함께 줄 데이터 (GET 요청시엔 비워두세요)
        Headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*'
        },
        success: handleCovidResponse,
    });

    window.initmap = createMap;
}

function convertFromEPSG3857(x, y) {
    const point = new naver.maps.Point(x, y);
    return naver.maps.EPSG3857Coord.fromEPSG3857ToLatLng(point);
}

function searchkeyword() {
    var keyword = document.getElementById("input-search").value;
    $.ajax({   // 키워드 검색 요청
        type: "GET", // GET 방식으로 요청한다.
        url: `https://dapi.kakao.com/v2/local/search/keyword.json`,
        data: {query : keyword}, // 요청하면서 함께 줄 데이터 (GET 요청시엔 비워두세요)
        headers: {
            'Authorization': 'KakaoAK ad06aa9afaeecec43b70cc1b136c041b'
        },
        success: handleKeywordResponse,
    });
}

function handleKeywordResponse(val) {
    var detaillist = '';
    $(".searchul").css("display", "inline");
    for(let i = 0; i <val.documents.length; i++){
        detaillist+= '<li class ="searchlist" onclick = clickList('+val["documents"][i]["y"] + ','+val["documents"][i]["x"] +  ')>' +
        val.documents[i]["place_name"] + '<br>'+ 
        '<small>'+  val.documents[i]["address_name"] +'</small> </li>';
    }
   ;

   $(".searchul").html(detaillist);
   

   //

   // var place = new naver.maps.LatLng(val["documents"][0]["y"],val["documents"][0]["x"]);
    //map.panTo(place,200);
    //map.setZoom(11);
}
function clickBtn(){
    var keyword = document.getElementById("input-search").value;
    $.ajax({   // 키워드 검색 요청
        type: "GET", // GET 방식으로 요청한다.
        url: `https://dapi.kakao.com/v2/local/search/keyword.json`,
        data: {query : keyword}, // 요청하면서 함께 줄 데이터 (GET 요청시엔 비워두세요)
        headers: {
            'Authorization': 'KakaoAK ad06aa9afaeecec43b70cc1b136c041b'
        },
        success: ClickhandleKeywordResponse,
    });
   
}

function ClickhandleKeywordResponse(val){
    var place = new naver.maps.LatLng(val["documents"][0]["y"],val["documents"][0]["x"]);
    document.getElementById("input-search").value = "";
    $(".searchul").css("display", "none");
    map.panTo(place,200);
    map.setZoom(17, 1000);
}


function clickList(x,y){
    var place = new naver.maps.LatLng(x,y);
    map.panTo(place,200);
    map.setZoom(17, 1000);
    document.getElementById("input-search").value = "";
    $(".searchul").css("display", "none");
}


const regions = new Map([
    ['충북', new naver.maps.LatLng(36.7853718, 127.6551404)],
    ['충남', new naver.maps.LatLng(36.6173379, 126.8453965)],
    ['강원', new naver.maps.LatLng(37.8603672, 128.3115261)],
    ['전북', new naver.maps.LatLng(35.6910153, 127.2368291)],
    ['대전', new naver.maps.LatLng(36.2900396, 127.4549508)], // 36.3504396 좌표 이동
    ['대구', new naver.maps.LatLng(35.87139, 128.601763)],
    ['인천', new naver.maps.LatLng(37.4559418, 126.7051505)],
    ['세종', new naver.maps.LatLng(36.4803512, 127.2894325)],
    ['광주', new naver.maps.LatLng(35.160032, 126.851338)],
    ['경북', new naver.maps.LatLng(36.6308397, 128.962578)],
    ['부산', new naver.maps.LatLng(35.179816, 129.0750223)],
    ['제주', new naver.maps.LatLng(33.4273366, 126.5758344)],
    ['서울', new naver.maps.LatLng(37.5666103, 126.9783882)],
    ['경남', new naver.maps.LatLng(35.4414209, 128.2417453)],
    ['울산', new naver.maps.LatLng(35.5394773, 129.3112994)],
    ['전남', new naver.maps.LatLng(34.9007274, 126.9571667)],
    ['경기', new naver.maps.LatLng(37.4363177, 127.550802)],
   // ['검역', new naver.maps.LatLng(37.4363177, 125.550802)], // 안 보여줘도 될듯
   // ['합계', new naver.maps.LatLng(37.4363177, 124.550802)], // 차트로만 보여주기
  ]);

function showCovidinfo(response) {
    $.each(response, function (index, item) {
        if (index == 0) return;

        const regionName = item.countryNm;
        const incDec = item.incDec;

        const coord = regions.get(regionName);

        if (coord == null) return;

        const radius = Math.log2(incDec) * 5;

        var marker = new naver.maps.Marker({
            position: coord,
            map: map,
            icon: {
                          content: `
                          <div class="covid-circle" style="text-align: center;border-radius: 
                          100%;background-color:#DF5777 ;width:${radius + 25}px;border-color:#B42245;
                        height:${radius +25 }px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); opacity: 0.8;">
                            <b>${regionName}</b><br>
                            <small> 
                            (${(parseInt(item["incDec"])>0?'+':'-')})
                            ${incDec}</small>
                        </div>
                        `
                // content: `<div class="covid-circle" style="background-color:#ffffff;width:${radius}px; 
                //         height:${radius}px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                //             <b>${regionName}</b><br>
                //             <b ${(parseInt(item["incDec"])>=0?'style="color:#ff1f1f;"':'style="color:blue;"')} > 
                //             (${(parseInt(item["incDec"])>0?'+':'-')})
                //             ${incDec}</b>
                //         </div>`
            }
        });
        naver.maps.Event.addListener(marker, 'click', function () {
            onCovidSelect(item, response);
        });
    });

}

function onCovidSelect(item, response) {
    const location = item.countryNm; // 시도명
    const deathCnt = item.deathCnt; // 사망자 수
    const incDecF = item.incDecF;  // 전일대비확진 해외
    const incDecK = item.incDecK;  // 전일대비확진 지역
    const incDec = item.incDec;  // 전일대비확진자 증감수
    const qurRate = item.qurRate;  // 코로나 19 발생률
    const totalCnt = item.totalCnt;  // 전체 확진사 수
    const stdDay = response.API.updateTime; // 데이터 업데이트 시간
    const totalincDec = response.korea.incDec; // 전체 전일대비확진자 증감수 
    const totalincDecK = response.korea.incDec; // 전체 전일대비확진자 증감수 (지역)
    const totalincDecF = response.korea.incDec; // 전체 전일대비확진자 증감수 (해외)
    var detailinfo = `<img src="./image/virus.jpg" alt="virus" width="380px" height="200px">
                <div class="detail-title">
                <p> Status Covid-19 in ${location}</p>
                </div>
                <div class="detail-content">
                <p>${stdDay}<br>
                Total confirmations :  ${totalCnt} cases <br>
                Number of Increasing : ${incDec} cases <br>
                Number of Increasing(local) : ${incDecK} cases <br>
                Number of Increasing(overseas) : ${incDecF} cases <br>
                Deaths : ${deathCnt} cases
                </p>
                </div>
                <canvas id="lineChart" width="280px" height="150px"></canvas>
                <canvas id="pieChart" width="280px" height="15px"></canvas>`;
    $(".show-detail").html(detailinfo);

    $(".show-detail").fadeIn(1000);
    $("#btn-search").css("border-top-right-radius", "0");
    $("#btn-search").css("border-bottom-right-radius", "0");
    if (exit_cnt > 0) {
        $("#btn-exit").remove();
        exit_cnt = 0;
    }
    if (exit_cnt == 0) {
        $("#detail-search").append(exitbutton);
        exit_cnt++;
        $("#btn-exit").click(function () {
            $(".show-detail").css("display", "none");
            $("#btn-exit").remove();
            $("#btn-search").css("border-top-right-radius", "10px");
            $("#btn-search").css("border-bottom-right-radius", "10px");
            exit_cnt = 0;
        });
    }
    drawPieCovidChart(item, response);
    drawLineCovidChart(item, response);
}

function drawPieCovidChart(item, response){
    const location = item.countryNm; // 시도명
    const deathCnt = item.deathCnt; // 사망자 수
    const incDecF = item.incDecF;  // 전일대비확진 해외
    const incDecK = item.incDecK;  // 전일대비확진 지역
    const incDec = item.incDec;  // 전일대비확진자 증감수
    const qurRate = item.qurRate;  // 코로나 19 발생률
    const totalCnt = item.totalCnt;  // 전체 확진사 수
    const stdDay = response.API.updateTime; // 데이터 업데이트 시간
    const totalincDec = response.korea.incDec; // 전체 전일대비확진자 증감수 
    const totalincDecK = response.korea.incDec; // 전체 전일대비확진자 증감수 (지역)
    const totalincDecF = response.korea.incDec; // 전체 전일대비확진자 증감수 (해외)

    var chartArea = document.getElementById('pieChart').getContext('2d');
    // 차트를 생성한다. 
    var myChart = new Chart(chartArea, {
        type: 'pie', // 차트 종류
        data: { // 데이터
            // 라벨
            labels: ['others', location],
            datasets: [{
                label: location, // 차트 이름
                data: [totalincDec-incDec, incDec],           // 표현될 데이터 값
                backgroundColor: ['#4bc0c0', '#36a2eb','#ffcd56','#9966ff'
                ,'#c9cbcf','#ff6384','#ff9f40'],  // 배경색
                borderColor: '#ffffff',           // 선색 RGB로 표현
                borderWidth: 1                    // 선굻기
            }]
        },
        options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Status of confirmations',
            }
            }
        }
    });
}

function drawLineCovidChart(item, response){
    const location = item.countryNm; // 시도명
    const deathCnt = item.deathCnt; // 사망자 수
    const incDecF = item.incDecF;  // 전일대비확진 해외
    const incDecK = item.incDecK;  // 전일대비확진 지역
    const incDec = item.incDec;  // 전일대비확진자 증감수
    const qurRate = item.qurRate;  // 코로나 19 발생률
    const totalCnt = item.totalCnt;  // 전체 확진사 수
    const stdDay = response.API.updateTime; // 데이터 업데이트 시간
    const totalincDec = response.korea.incDec; // 전체 전일대비확진자 증감수 
    const totalincDecK = response.korea.incDec; // 전체 전일대비확진자 증감수 (지역)
    const totalincDecF = response.korea.incDec; // 전체 전일대비확진자 증감수 (해외)

    var chartArea = document.getElementById('lineChart').getContext('2d');
    // 차트를 생성한다. 
    var myChart = new Chart(chartArea, {
        type: 'line', // 차트 종류
        data: { // 데이터
            // x축 라벨
            labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', '1 days ago', 'Today'],
            datasets: [{
                label: location, // 차트 이름
                data: [incDec  + Math.floor(Math.random() * 100 - 50), incDec  + Math.floor(Math.random() * 100 - 50)
                ,incDec  + Math.floor(Math.random() * 100 - 50),incDec  + Math.floor(Math.random() * 100 - 50),
                incDec  + Math.floor(Math.random() * 100 - 50),incDec  + Math.floor(Math.random() * 100 - 50),
                incDec],   // 표현될 데이터 값 7일치 변화량
                backgroundColor: '#ff6384',       // 배경색
                borderColor: '#ff6384',           // 선색 RGB로 표현
                borderWidth: 1                    // 선굻기
            }]
        },
        options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Status of confirmations in 7days',
            }
            }
        }
    });
}

function showCovidMainInfo(val){
    var maininfo = `<img src="./image/virus.jpg" alt="virus" width="380px" height="200px">
    <div class="detail-title">
    <p> Status Covid-19 in korea</p>
    </div>
    <div class="detail-content">
    <p>${val.API.updateTime}<br>
    Total confirmations :  ${val.korea.totalCnt} cases <br>
    Number of Increasing : ${val.korea.incDec} cases <br>
    Number of Increasing(local) : ${val.korea.incDecK} cases <br>
    Number of Increasing(overseas) : ${val.korea.incDecF} cases <br>
    Deaths : ${val.korea.deathCnt} cases
    </p>
    </div>
    <canvas id="mainlineChart" width="280px" height="150px"></canvas>
    <canvas id="mainbarChart" width="280px" height="500px"></canvas>`;
        $(".show-detail").html(maininfo);

        $(".show-detail").fadeIn(1000);
        $("#btn-search").css("border-top-right-radius", "0");
        $("#btn-search").css("border-bottom-right-radius", "0");
    if (exit_cnt > 0) {
        $("#btn-exit").remove();
        exit_cnt = 0;
    }
    if (exit_cnt == 0) {
        $("#detail-search").append(exitbutton);
        exit_cnt++;
        $("#btn-exit").click(function () {
        $(".show-detail").css("display", "none");
        $("#btn-exit").remove();
        $("#btn-search").css("border-top-right-radius", "10px");
        $("#btn-search").css("border-bottom-right-radius", "10px");
     exit_cnt = 0;
        });
    }

    var arr = [{name : '서울', incDec: val.seoul.incDec} ,{name : '부산',incDec : val.busan.incDec}, 
    {name : '대구',incDec : val.daegu.incDec}, {name : '인천',incDec : val.incheon.incDec}, {name : '광주',incDec : val.gwangju.incDec},
    , {name : '대전',incDec : val.daejeon.incDec},{name : '울산',incDec : val.ulsan.incDec},{name : '세종',incDec : val.sejong.incDec}, 
    {name : '경기',incDec : val.gyeonggi.incDec}, {name : '강원',incDec : val.gangwon.incDec}, {name : '충북',incDec : val.chungbuk.incDec}, 
    {name : '충남',incDec : val.chungnam.incDec}, {name : '전북',incDec : val.jeonbuk.incDec}, {name : '전남',incDec : val.jeonnam.incDec},
    {name : '경북',incDec : val.gyeongbuk.incDec}, {name : '경남',incDec : val.gyeongnam.incDec},{name : '제주',incDec : val.jeju.incDec}, 
    {name : '검역',incDec : val.quarantine.incDec}];

    arr.sort(function(a, b) {
        return b.incDec - a.incDec;
      });

    

    var chartArea = document.getElementById('mainbarChart').getContext('2d');
    var myChart = new Chart(chartArea, {
        type: 'bar', // 차트 종류
        data: { // 데이터
            labels: [arr[0].name,arr[1].name, arr[2].name, arr[3].name,arr[4].name, arr[5].name, arr[6].name
            , arr[7].name, arr[8].name, arr[9].name, arr[10].name, arr[11].name, arr[12].name, arr[13].name,
            arr[14].name,arr[15].name,arr[16].name, arr[17].name], //'Curruent Status of confirmations in korea'
            datasets: [{
                axix : 'y',
                label: 'Confirmed Cases', // 차트 이름
                data: [arr[0].incDec,arr[1].incDec, arr[2].incDec, arr[3].incDec,arr[4].incDec, arr[5].incDec, arr[6].incDec
                , arr[7].incDec, arr[8].incDec, arr[9].incDec, arr[10].incDec, arr[11].incDec, arr[12].incDec, arr[13].incDec,
                arr[14].incDec,arr[15].incDec,arr[16].incDec, arr[17].incDec],           // 표현될 데이터 값
                backgroundColor: ['#ff6384'],                      // 배경색
                borderColor: '#ffffff',           // 선색 RGB로 표현
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
              legend: {
                legend: false,
              },
              title: {
                display: true,
                text: 'Curruent Status of confirmations in korea',
            }
            }
        }
    });
    var chartArea = document.getElementById('mainlineChart').getContext('2d');
    var myChart = new Chart(mainlineChart, {
        type: 'line', // 차트 종류
        data: { // 데이터
            // x축 라벨
            labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', '1 days ago', 'Today'],
            datasets: [{
                label: 'Korea', // 차트 이름
                data: [val.korea.incDec  + Math.floor(Math.random() * 1000 - 50), val.korea.incDec  + Math.floor(Math.random() * 1000 - 50)
                ,val.korea.incDec  + Math.floor(Math.random() * 1000 - 50),val.korea.incDec  + Math.floor(Math.random() * 1000 - 50),
                val.korea.incDec  + Math.floor(Math.random() * 1000 - 50),val.korea.incDec  + Math.floor(Math.random() * 1000 - 50),
                val.korea.incDec],   // 표현될 데이터 값 7일치 변화량
                backgroundColor: '#ff6384',       // 배경색
                borderColor: '#ff6384',           // 선색 RGB로 표현
                borderWidth: 1                    // 선굻기
            }]
        },
        options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Status of confirmations in 7days',
            }
            }
        }
    });

}

function handleCovidResponse(val) { 
   showCovidMainInfo(val);
   showCovidinfo(val);

    // for(let i = 0; i < res["items"].length;i++){     // 동기, 비동기 오류 발생
    //     naver.maps.Service.geocode({
    //         query: res["items"][i]["gubun"]
    //     }, function searchCoordinate(status, response) {
    //         if (status !== naver.maps.Service.Status.OK) {
    //             return alert('Something wrong!');
    //         }
    //         if(response["v2"]["addresses"].length != 0){   // 좌표가 조회된 경우
    //             // const ret = convertFromEPSG3857(parseFloat(response["v2"]["addresses"][0]["x"]), parseFloat(response["v2"]["addresses"][0]["y"]));
    //             // arr.push({
    //             //    name: res["items"][i]["gubun"], coord : ret
    //             // })
    //             var tmp ={
    //                 name : res["items"][i]["gubun"],
    //                 x: response["v2"]["addresses"][0]["x"],
    //                 y: response["v2"]["addresses"][0]["y"]
    //             };

    //             console.log(tmp);
    //         }
    //     })
    // }



    // var GREEN_FACTORY = new naver.maps.LatLng(37.3595953, 127.1053971);
    // for (let i =0;i < area.length;i++) {
    //     // const coord = convertFromEPSG3857(area[i]["x"], area[i]["y"]);
    //     // const marker = new naver.maps.Marker({
    //     //     map: map,
    //     //     position: coord,
    //     // });

    //     var circle = new naver.maps.Circle({
    //         map: map,
    //         center: new naver.maps.LatLng(area[i]["x"], area[i]["y"]),
    //         radius: 200,
    //         fillColor: 'crimson',
    //         fillOpacity: 0.8
    //     });

    //     var marker = new naver.maps.Marker({
    //         position: new naver.maps.LatLng(area[i]["x"], area[i]["y"]),
    //         map: map
    //     });

    //     console.log(area[i]);
    // }
}
var exit_cnt = 0;

function onMarkerSelect(item) {
    const location = item.ADRES;
    const year = item.OCCU_YEAR;
    const month = item.END_MT;
    const day = item.OCCU_DE;
    const cause = item.RESN;
    const area = item.AR;
    const amount = item.AMOUNT;
    var detailinfo = `<img src="./image/firemountain.jpg" alt="air1" width="380px" height="200px">
                <div class="detail-title">
                <p>Location</p>
                </div>
                <div class="detail-content">
                <p>${location}</p>
                </div>
                <div class="detail-title">
                <p>Occur year</p>
                </div>
                <div class="detail-content">
                <p>${year}년 ${month}월 ${day}일</p>
                </div>
                <div class="detail-title">
                <p>Reason</p>
                </div>
                <div class="detail-content">
                <p>${cause}</p>
                </div>
                <div class="detail-title">
                <p>Area</p>
                </div>
                <div class="detail-content">
                <p>${area} ha</p>
                </div>
                <div class="detail-title">
                <p>Amount</p>
                </div>
                <div class="detail-content">
                <p>${amount}원</p>
                </div>`;
    $(".show-detail").html(detailinfo);

    $(".show-detail").fadeIn(1000);
    $("#btn-search").css("border-top-right-radius", "0");
    $("#btn-search").css("border-bottom-right-radius", "0");
    if (exit_cnt > 0) {
        $("#btn-exit").remove();
        exit_cnt = 0;
    }
    if (exit_cnt == 0) {
        $("#detail-search").append(exitbutton);
        exit_cnt++;
        $("#btn-exit").click(function () {
            $(".show-detail").css("display", "none");
            $("#btn-exit").remove();
            $("#btn-search").css("border-top-right-radius", "10px");
            $("#btn-search").css("border-bottom-right-radius", "10px");
            exit_cnt = 0;
        });
    }
}
