import "./App.css";
import { ThreeScene } from "./ThreeScene";
import { FlappyBird } from "./FlappyBird";
import { useEffect } from "react";



function App() {

    useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    console.log("tg:", tg);

    if (!tg) {
      console.log("Не в окружении Telegram Mini App (window.Telegram.WebApp отсутствует)");
      return;
    }

    // Данные пользователя
    console.log("id:", user?.id);
    //783751626
    console.log("first_name:", user?.first_name);
    //Кост
    console.log("last_name:", user?.last_name);
    //-
    console.log("username:", user?.username);
    //Deadly_Harlequine


    // start_param (то, что приходит из ссылки вида ?startapp=xxxx)
    console.log("start_param:", tg.initDataUnsafe);

    tg.ready?.(); // обычно вызывают при старте
  }, []);
  return <FlappyBird />;
}

export default App;
