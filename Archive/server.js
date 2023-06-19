
////////////////////////////////////////////
//firebase
const exp = require('express');
const cors = require('cors');
const admin = require('./config');
const db = admin.firestore();
const app = exp();
app.use(exp.json());
app.use(cors());

//////////////////////////////////////////////////////////
const readRouter = exp.Router();
var localname = "";
readRouter.get('/', async (req, res) => {
  try {
    const snapshot = await collectionPost.get();
    const posts = [];
    snapshot.forEach((doc) => {
      var post = doc.data();
      posts.push(post);
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ message: 'An error occurred while retrieving data' });
  }
});

app.use('/read', readRouter);


// 정적 파일 제공을 위한 미들웨어 추가
app.use(exp.static(__dirname));

const writeRouter = exp.Router();
const collectionPost = db.collection('Posts');

writeRouter.post("/", async (req, res) => {
  try {
    const {userName, comment, location, topic, like} = req.body;
    // const name = req.session.name; // 사용자 이름 가져오기
    const docRef = await collectionPost.add({
      userName,
      comment,
      location,
      topic,
      like,
    });
    var docId = docRef.id;
    res.status(200).json({ message: "Data added successfully" });
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).json({ message: "An error occurred while adding data" });
  }
});

app.use('/write', writeRouter);

///////////////////////////////update///////////////////////
const likeRouter = exp.Router();

likeRouter.post('/', async (req, res) => {
  try {
    const { docId, action } = req.body;

    const postRef = collectionPost.doc(docId); // Access the specific document
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const likeCount = postDoc.data().like;
    let updatedLikeCount;

    if (action === 'plus') {
      updatedLikeCount = likeCount + 1;
    } else if (action === 'minus') {
      updatedLikeCount = likeCount > 0 ? likeCount - 1 : 0;
    } else {
      res.status(400).json({ message: "Invalid action" });
      return;
    }

    // 게시물 업데이트
    await postRef.update({ like: updatedLikeCount });

    res.status(200).json({ message: 'Like count updated successfully', updatedLikeCount });
  } catch (error) {
    console.error('Error updating like count:', error);
    res.status(500).json({ message: 'An error occurred while updating like count' });
  }
});

app.use('/like', likeRouter);
//////////////////////////Sign Up/////////////////////////////
const collectionUser = db.collection('User');
const signupRouter = exp.Router();

signupRouter.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    await collectionUser.add({
      name,
      email,
      password
    });

    res.status(200).json({ message: "Data added successfully" });
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).json({ message: "An error occurred while adding data" });
  }
});

app.use('/signup', signupRouter);

////////////////////////////////////////////////////////////
const session = require('express-session');

// ...

// 세션 설정
app.use(
  session({
    secret: '12131231',
    resave: false,
    saveUninitialized: true
  })
);
const loginstateRouter = exp.Router();

loginstateRouter.get('/', (req, res) => {
  const loggedIn = req.session.loggedIn || false;
  // console.log(req.session);
  req.session.localname = localname;
  res.json({ loggedIn, localname});
});
app.use('/checkLoginStatus', loginstateRouter);

////////////////////////////////////////////////////////////////////////////////
///////////////////        SIGNIN  ///////////////////////////

// checkLoginStatus 함수 정의
function checkLoginStatus(req, res) {
  const loggedIn = req.session.loggedIn || false;
  req.session.localname = localname;
  return loggedIn; // 로그인 상태 반환
}

const signinRouter = exp.Router();

signinRouter.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const snapshot = await collectionUser.where("email", "==", email).get();

    if (snapshot.empty) {
      console.log("실패: 사용자를 찾을 수 없습니다.");
      res.status(401).json({ message: "로그인 실패" });
      return;
    }

    const user = snapshot.docs[0].data();
    if (user.password !== password) {
      console.log("실패: 비밀번호가 일치하지 않습니다.");
      res.status(401).json({ message: "로그인 실패" });
      return;
    }

    console.log("성공: 로그인 성공");

    // 로그인 상태를 세션에 저장
    req.session.loggedIn = true;

    localname = user.name;
    console.log(localname);
    res.status(200).json({ message: "로그인 성공" });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
  }
});

app.use('/signin', signinRouter);

////////////////////Logout//////////////////////////////
const logoutRouter = exp.Router();

logoutRouter.post("/", (req, res) => {
  // 로그아웃 처리
  req.session.destroy((error) => {
    if (error) {
      console.error("Error logging out:", error);
      res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다." });
    } else {
      res.clearCookie("connect.sid"); // 세션 쿠키 제거
      console.log("성공: 로그아웃 성공");
      localname = "";
      res.json({ success: true });
    }
  });
});

app.use('/logout', logoutRouter);
//////////////////////////////////////////////////////////
var path = require('path');
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'main.html');
  res.sendFile(filePath);
  
});
app.get('/community.html', (req, res) => {
  const filePath = path.join(__dirname, 'community.html');
  res.sendFile(filePath);
});
app.get('/login.html', (req, res) => {
  const filePath = path.join(__dirname, 'login.html');
  res.sendFile(filePath);
});
app.get('/signup.html', (req, res) => {
  const filePath = path.join(__dirname, 'signup.html');
  res.sendFile(filePath);
});
app.get('/forest-fire.html', (req, res) => {
  const filePath = path.join(__dirname, 'forest-fire.html');
  res.sendFile(filePath);
});
app.get('/covid19.html', (req, res) => {
  const filePath = path.join(__dirname, 'covid19.html');
  res.sendFile(filePath);
});
app.get('/air-pollution.html', (req, res) => {
  const filePath = path.join(__dirname, 'air-pollution.html');
  res.sendFile(filePath);
});
app.get('/earthquake.html', (req, res) => {
  const filePath = path.join(__dirname, 'earthquake.html');
  res.sendFile(filePath);
});
app.get('/flood.html', (req, res) => {
  const filePath = path.join(__dirname, 'flood.html');
  res.sendFile(filePath);
});
app.listen(5501, function () {
  console.log("server is running.");
});

