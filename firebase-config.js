// Firebase接続前はデモモード。実運用時は firebase:null を下の設定オブジェクトに置き換えます。
// Webアプリ用のfirebaseConfigと管理者UIDのみを使用。パスワードやサービスアカウント鍵は書かないでください。
window.MIND_BATTLE_CONFIG = {
  firebase: null,
  adminUids: []
};

/* 設定例
window.MIND_BATTLE_CONFIG = {
  firebase: {
    apiKey: "Firebase WebアプリのAPIキー",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_DATABASE.firebasedatabase.app",
    projectId: "YOUR_PROJECT",
    appId: "Firebase WebアプリのappId"
  },
  adminUids: ["Authenticationの管理者UID"]
};
*/
