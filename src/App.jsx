import "./App.scss";
import { ThreeScene } from "./ThreeScene";
import { FlappyBird } from "./components/FlappyBird/FlappyBird";
import { useEffect } from "react";
// import Page from "./components/page1/Page";
import Page from "./components/page1/page";

function App() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    console.log("tg:", tg);

    if (!tg) {
      console.log(
        "Не в окружении Telegram Mini App (window.Telegram.WebApp отсутствует)"
      );
      return;
    }

    console.log("id:", user?.id);
    console.log("first_name:", user?.first_name);
    console.log("last_name:", user?.last_name);
    console.log("username:", user?.username);

    console.log("start_param:", tg.initData);

    tg.ready?.();
  }, []);


  // return <FlappyBird />;
  return (
    <div className="wrap">
      <Page/>
    </div>
  )
}

export default App;
