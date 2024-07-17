
function clickNewsMenu(num){
    var all = document.getElementById("all");
    var air = document.getElementById("air");
    var virus = document.getElementById("virus");
    var earthquake = document.getElementById("earthquake");
    var wildfire = document.getElementById("wildfire");
    var flood = document.getElementById("flood");
if(num == 0){
    
    all.classList.add("active");
    air.classList.remove("active");
    virus.classList.remove("active");
    earthquake.classList.remove("active");
    wildfire.classList.remove("active");
    flood.classList.remove("active");
    searchNews('catastrophe');
}
else if(num == 1){
    all.classList.remove("active");
    air.classList.add("active");
    virus.classList.remove("active");
    earthquake.classList.remove("active");
    wildfire.classList.remove("active");
    flood.classList.remove("active");
    searchNews('fine dust');
}
else if(num == 2){
    all.classList.remove("active");
    air.classList.remove("active");
    virus.classList.add("active");
    earthquake.classList.remove("active");
    wildfire.classList.remove("active");
    flood.classList.remove("active");
    searchNews('covid omicron');
}
else if(num == 3){
    all.classList.remove("active");
    air.classList.remove("active");
    virus.classList.remove("active");
    earthquake.classList.add("active");
    wildfire.classList.remove("active");
    flood.classList.remove("active");
    searchNews('earthquakes');
}
else if(num == 4){
    all.classList.remove("active");
    air.classList.remove("active");
    virus.classList.remove("active");
    earthquake.classList.remove("active");
    wildfire.classList.add("active");
    flood.classList.remove("active");
    searchNews('forest fire');
}
else if(num == 5){
    all.classList.remove("active");
    air.classList.remove("active");
    virus.classList.remove("active");
    earthquake.classList.remove("active");
    wildfire.classList.remove("active");
    flood.classList.add("active");
    searchNews('flood');
}
}

function searchNews(keyword) {
    var query = "https://newsapi.org/v2/everything?q=" +keyword +"&sortBy=publishedAt&from=2023-05-15&apiKey=&Language=en";
    $.ajax({   // 코로나 API 요청
        type: "GET", // GET 방식으로 요청한다.
        url: query,
        data: {}, // 요청하면서 함께 줄 데이터 (GET 요청시엔 비워두세요)
        Headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*'
        },
        success: handleNewsResponse,
    });
}

function handleNewsResponse(val) {
    var newslist = '';
    for(let i = 0; (i <val["articles"].length) && i<30 ; i++){
        if((i%5) == 0){
           newslist += '<div class="card-group row">';
        }
        let date = new Date( val["articles"][i]["publishedAt"]);
        var substr =val["articles"][i]["title"].substring(0,50);
        newslist+= '<div class="card col-md-2.4"> <a href='+ val["articles"][i]["url"] +'> <img src='+ ((val["articles"][i]["urlToImage"]!=null)?(val["articles"][i]["urlToImage"]):'"./image/noimage.png" ') + 
        ' class="card-img-top" alt="img">'+'</a>'+
        '<div class="card-body"><p class="card-title"><strong> '+ ((val["articles"][i]["title"].length<50)?val["articles"][i]["title"]:(substr.substring(0,substr.lastIndexOf(" ")) + '...')) +' </strong></p>'+
        '<p class="card-text"><small class="text-body-secondary">'+Math.floor(((Date.now() - date.getTime())/1000)/3600) + ' hours ago </small></p></div></div>';
        if((i%5) == 4){
            newslist += '</div>';
        }
    }
    $("#newscard").html(newslist);
}


clickNewsMenu(0);
