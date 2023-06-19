function checkLoginStatus() {

    $.ajax({
      url: '/checkLoginStatus',
      method: 'GET',
      dataType: 'json',
      success: function(data) {
        if (data.loggedIn) {
          // 로그인된 상태라면 Sign in과 Sign up 버튼을 숨기고 Logout 버튼을 보이게 함
          $('#userName').html(data.localname);
          $('#signinBtn').hide();
          $('#signupBtn').hide();
          $('#logoutBtn').show();
          $('#userName').show();

        } else {
          // 로그인되지 않은 상태라면 Sign in과 Sign up 버튼을 보이게 함
          $('#signinBtn').show();
          $('#signupBtn').show();
          $('#logoutBtn').hide();
          // $('#userName').hide();

        }
      },
      error: function(error) {
        console.error('Error checking login status:', error);
      }
    });
  }
  function logout() {
    $.ajax({
      url: '/logout',
      method: 'POST',
      dataType: 'json',
      success: function(data) {
        if (data.success) {
          // 로그아웃 성공 시 Sign in과 Sign up 버튼을 보이게 함
          $('#signinBtn').show();
          $('#signupBtn').show();
          $('#logoutBtn').hide();
          var link = 'http://localhost:3000/main.html';
          location.href = link;
          location.replace(link);
          window.open(link);
        }
      },
      error: function(error) {
        console.error('Error logging out:', error);
      }
    });
  }
  
  // 로그아웃 버튼 클릭 이벤트 처리
  $('#logoutBtn').click(function() {
    logout();
  });
  // 페이지가 로드될 때 로그인 상태를 확인하는 함수 호출
  $(document).ready(function() {
    checkLoginStatus();
  });