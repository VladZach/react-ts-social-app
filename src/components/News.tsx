import {
  get,
  getDatabase,
  ref,
  query,
  limitToLast,
  onValue,
} from "firebase/database";
import React, { useState } from "react";
import Loader from "./Loader";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Post, { PostProps } from "./Post";
import { getUserData } from "./UserProfile";
import InfiniteScroll from "react-infinite-scroll-component";

export default function News() {
  const [news, setNews] = useState<PostProps[]>([]);
  const newsPerScroll = 10;
  const db = getDatabase();
  const [amountOfNewsToShow, setAmountOfNewsToShow] = useState(newsPerScroll);
  const { currentUser } = useAuth();
  const [totalNewsAmount, setTotalNewsAmount] = useState(0);

  async function getNews(isCalledByNext: boolean) {
    let amount = amountOfNewsToShow;
    //чтобы избежать увеличения счётчика при рендерах, вызванных не next() скролла
    if (isCalledByNext) {
      amount += newsPerScroll;
    }
    const subscriptionsRef = ref(db, "users/" + currentUser!.uid + "/news/");
    const newsRef = query(subscriptionsRef, limitToLast(amount));
    const news = await get(newsRef);
    const newsArr: PostProps[] = [];
    const promises: Promise<void>[] = [];
    news.forEach((item) => {
      const newRef = ref(db, "posts/" + item.key);
      promises.push(
        get(newRef).then((snapshot) => {
          const newsItem = snapshot.val();
          newsItem.postId = item.key;
          return getUserData(snapshot.val().authorId).then((userSnap) => {
            const user = userSnap.val();
            newsItem.photoUrl = user.photoUrl;
            newsItem.userName = user.fullName;
            newsArr.push(newsItem);
          });
        })
      );
    });
    await Promise.all(promises);
    setAmountOfNewsToShow(amount);
    setNews(newsArr.reverse());
  }

  useEffect(() => {
    getNews(false);
  }, [totalNewsAmount]);

  async function getNewsAmount() {
    const subscriptionsRef = ref(db, "counters/news/" + currentUser!.uid);
    onValue(subscriptionsRef, (snapshot) => {
      setTotalNewsAmount(snapshot.val());
    });
  }
  useEffect(() => {
    getNewsAmount();
  }, []);

  return (
    <div className="page page_centralized container">
      <div className="wall bordered-container">
        <InfiniteScroll
          next={getNews.bind(null, true)}
          hasMore={totalNewsAmount > news.length}
          loader={<Loader></Loader>}
          dataLength={news.length}
        >
          {news.map((item) => {
            return <Post key={item.createdAt} {...item}></Post>;
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
}
