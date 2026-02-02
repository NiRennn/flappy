


export default function Page() {

    

  const getData = () => {
    // const user = tg?.initDataUnsafe?.user;
    const tg = window.Telegram?.WebApp;


    //   const tg = useMemo(() => (window as any)?.Telegram?.WebApp, []);



    // console.log("id:", user?.id);
    // console.log("first_name:", user?.first_name);
    // console.log("last_name:", user?.last_name);
    // console.log("username:", user?.username);

//    console.log("id:", user?.id);
//     console.log("first_name:", user?.first_name);
//     console.log("last_name:", user?.last_name);
//     console.log("username:", user?.username);
    console.log("start_param:", tg.initData);
  };

  return (
    <div>
      <button onClick={getData}>get</button>
    </div>
  );
}
