
$(document).ready(function () {

  getPosts();
});

function addCard(userName, comment, location, topic, like) {
  const cardBody = $('.card-container');
  const rand_1_10 = Math.floor(Math.random() * 30) + 1;
  const cardContent = `
      <div class="card mb-4">
      <div class="card-body">
        <p>${comment}</p>
        <div class="d-flex justify-content-between">
          <div class="d-flex flex-row align-items-center">
          <img src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(${rand_1_10}).webp" alt="avatar" width="25"
                  height="25" />
            <p class="small mb-0 ms-2">${userName}</p>
            <p class="small mb-0 ms-2"> / </p>
            <p class="small mb-0 ms-2">${location}</p>
          </div>
          <div class="d-flex flex-row align-items-center">
            <p class="small text-muted mb-0 comment-tag">${topic}</p>
            <div class="${userName} heart" onclick="likefunc(event)"><img src="./image/heart.png" width="25"
            height="25" /></div>
            
            <p class="likeCnt small text-mutesd mb-0">${like}</p>
          </div>
        </div>
      </div>
    </div>
    `;
  cardBody.append(cardContent);
}
function likefunc(event) {
  const heartIcon = $(event.currentTarget);
  const likeCount = heartIcon.siblings('.likeCnt');
  const heartImg = heartIcon.find('img');
  var currentLikes = parseInt(likeCount.text());
  var newLikes = currentLikes;

  if (heartImg.attr('src') === './image/heartfill.png') {
    heartImg.attr('src', './image/heart.png');
    newLikes--;
  } else {
    heartImg.attr('src', './image/heartfill.png');
    newLikes++;
  }
  
  likeCount.text(newLikes);
}

var aircnt = firecnt = quakecnt = covidcnt = floodcnt = 0;
var seoulcnt = kkcnt = cccnt = kwcnt = kscnt = jlcnt = 0;
var likecnt = 0;
$('#submitBtn').click(function () {
  var comment = $('#comment').val();
  var topic = $('#topic').val();
  var location = $('#location').val();
  var uName = $('#uName').html();

  // Firebase에 데이터 저장
  $.ajax({
    url: 'http://localhost:5501/write',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({
      userName: uName,
      comment: comment,
      topic: topic,
      location: location,
      like: likecnt,
    }),
    success: function (res) {
      console.log('Data added successfully');
      var link = 'http://localhost:5501/community.html';
      location.href = link;
      location.replace(link);
      window.open(link);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error adding data:', errorThrown);
    }
  });
});
function getPosts() {
  $.ajax({
    url: 'http://localhost:5501/read',
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      data.forEach(function (post) {
        addCard(post.userName, post.comment, post.location, post.topic, post.like);
        if (post.topic == "Fine dust") {
          aircnt++;
        }
        if (post.topic == "Virus") {
          covidcnt++;
        }
        if (post.topic == "Earthquake") {
          quakecnt++;
        }
        if (post.topic == "Forest Fire") {
          firecnt++;
        }
        if (post.topic == "Flood") {
          floodcnt++;
        }
        if (post.location.includes('서울')) {
          seoulcnt++;
        }
        if (post.location.includes("경기")) {
          kkcnt++;
        }
        if (post.location.includes("충청")) {
          cccnt++;
        }
        if (post.location.includes("강원")) {
          kwcnt++;
        }
        if (post.location.includes("경상")) {
          kscnt++;
        }
        if (post.location.includes("전라")) {
          jlcnt++;
        }
      });
      showChart1(aircnt, firecnt, covidcnt, quakecnt, floodcnt);
      showChart2(seoulcnt, kkcnt, cccnt, kwcnt, kscnt, jlcnt);
    },
    error: function (xhr, status, error) {
      console.error(error);
    }
  });
}
function getChart(id){
  // $('#comm-chart').hide();
  // $('#comm-chart2').hide();
  // $('#' + id).css('background-color', 'rgb(238, 238, 238)');

  // 해당 차트 요소의 현재 상태를 확인합니다.
  // var isHidden = $('#comm-chart').is(':hidden');
  
  var isHidden = $('.commchart').is(':hidden');
  // 차트 요소가 보여지는 상태일 때는 fadeOut으로 숨깁니다.
  if (!isHidden) {
    $('.commchart').fadeOut();
    // $('#comm-chart').fadeOut();
    // $('#comm-chart2').fadeOut();
    $('#' + id).css('background-color', '');

  }
  // 차트 요소가 숨겨진 상태일 때는 fadeIn으로 나타냅니다.
  else {
    $('.commchart').fadeIn();

    // $('#comm-chart').fadeIn();
    // $('#comm-chart2').fadeIn();
    $('#' + id).css('background-color', 'rgb(238, 238, 238)');
  }

}
function getCategory(category, id) {
  $('h2').css('background-color', '');
  
  // id값을 받아서 해당 id의 style을 변경합니다.
  function changeBackgroundColor(id) {
    $('#' + id).css('background-color', 'rgb(238, 238, 238)');
  }

  // 예시로 'exampleId'라는 id를 가진 요소의 background-color를 변경합니다.
  changeBackgroundColor(id);

  $('.card-container').find('.card').remove();
  $.ajax({
    url: 'http://localhost:5501/read',
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      if (category == 'all') {
        data.forEach(function (post) {
          addCard(post.userName, post.comment, post.location, post.topic, post.like);
        });
      }
      else if (category == 'popular'){
        data.sort(function(a, b) {
          return b.like - a.like; 
        });
      
        var popularPosts = data.slice(0, 10);
      
        popularPosts.forEach(function(post) {
          addCard(post.userName, post.comment, post.location, post.topic, post.like);
        });
      }
      else {
        data.forEach(function (post) {
          if (category == post.topic) {
            addCard(post.userName, post.comment, post.location, post.topic, post.like);
          }
        });
      }

    },
    error: function (xhr, status, error) {
      console.error(error);
    }
  });
}

function checkLoginStatus() {
  $.ajax({
    url: '/checkLoginStatus',
    method: 'GET',
    dataType: 'json',
    success: function (data) {
      if (data.loggedIn) {
        // 로그인된 상태라면 Sign in과 Sign up 버튼을 숨기고 Logout 버튼을 보이게 함
        $('#uName').html(data.localname);
        $('#signinBtn').hide();
        $('#signupBtn').hide();
        $('#logoutBtn').show();
        // $('#uName').show();

      } else {
        // 로그인되지 않은 상태라면 Sign in과 Sign up 버튼을 보이게 함
        $('#signinBtn').show();
        $('#signupBtn').show();
        $('#logoutBtn').hide();
        // $('#uName').hide();

      }
    },
    error: function (error) {
      console.error('Error checking login status:', error);
    }
  });
}
function logout() {
  $.ajax({
    url: '/logout',
    method: 'POST',
    dataType: 'json',
    success: function (data) {
      if (data.success) {
        // 로그아웃 성공 시 Sign in과 Sign up 버튼을 보이게 함
        $('#signinBtn').show();
        $('#signupBtn').show();
        $('#logoutBtn').hide();
        $('#uName').hide();
        var link = 'http://localhost:5501/main.html';
        location.href = link;
        location.replace(link);
        window.open(link);
      }
    },
    error: function (error) {
      console.error('Error logging out:', error);
    }
  });
}

// 로그아웃 버튼 클릭 이벤트 처리
$('#logoutBtn').click(function () {
  logout();
});
// 페이지가 로드될 때 로그인 상태를 확인하는 함수 호출
$(document).ready(function () {
  checkLoginStatus();
});


function showChart1(aircnt, firecnt, covidcnt, quakecnt, floodcnt) {
  const ctx = document.getElementById('comm-chart');
  // console.log(aircnt);
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        label: 'Category',
        data: [aircnt, firecnt, covidcnt, quakecnt, floodcnt],
        // borderColor: '#DA000060',
        backgroundColor: ['rgb(130, 148, 196)', 'rgb(172, 177, 214)', 'rgb(219, 223, 234)', 'rgb(255, 234, 210)', '#FFF4F4'],
      }],
      labels: ['Fine Dust', 'Forest Fire', 'Covid-19', 'Earthquake', 'Flood']
    },
    options: {
      plugins: {
        datalabels: {
          display: true,
        },
        title: {
          display: true,
          text: 'Number of comments by category',
        },
        // subtitle: {
        //   display: true,
        //   text: ''
        // },
        legend: {
          position: 'bottom',
        },
      }
    }
  });

}
function showChart2(seoulcnt, kkcnt, cccnt, kwcnt, kscnt, jlcnt) {

  const ctx2 = document.getElementById('comm-chart2');
  console.log(seoulcnt);
  const chart2 = new Chart(ctx2, {
    type: 'doughnut',

    data: {
      datasets: [{
        label: 'Location',
        data: [seoulcnt, kkcnt, cccnt, kwcnt, kscnt, jlcnt],
        // borderColor: '#DA000060',
        backgroundColor: ['rgb(185, 237, 221)', 'rgb(100, 92, 187)', 'rgb(160, 132, 220)', 'rgb(191, 172, 226)', 'rgb(235, 199, 230)', 'rgb(185, 237, 221)'],
      }],
      labels: ['Seoul', 'Gyeonggi-do', 'Chungcheong-do', 'Gangwon-do', 'Gyeongsang-do', 'Jeolla-do']
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Number of comments by region',
        },
        // subtitle: {
        //   display: true,
        //   text: ''
        // },
        legend: {
          position: 'bottom',
        },
      }
    }
  });
}
