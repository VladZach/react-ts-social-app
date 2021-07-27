import { get, getDatabase, ref, query, limitToLast } from "firebase/database";
import React, { useState } from "react";
import Loader from "./Loader";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Post, { PostProps } from "./Post";
import { getUserData } from "./UserProfile";
import InfiniteScroll from "react-infinite-scroll-component";

export default function News() {
  const [news, setNews] = useState<PostProps[]>([]);
  const [scrollPosition, setScrollPosition] = useState(10);
  const { currentUser } = useAuth();
  const [totalNewsAmount, setTotalNewsAmount] = useState(0);

  async function getNews() {
    if (!totalNewsAmount) return;
    const db = getDatabase();
    const subscriptionsRef = ref(db, "users/" + currentUser!.uid + "/news/");
    const newsRef = query(subscriptionsRef, limitToLast(scrollPosition));
    const news = await get(newsRef);

    const newsArr: PostProps[] = [];
    const promises: Promise<void>[] = [];
    news.forEach((item) => {
      const newRef = ref(db, "posts/" + item.key);
      promises.push(
        get(newRef).then((snapshot) => {
          const newsItem = snapshot.val();
          newsItem.postId = item.key;
          return getUserData(snapshot.val().author).then((userSnap) => {
            const user = userSnap.val();
            newsItem.photoUrl = user.photoUrl;
            newsItem.userName = user.fullName;
            newsArr.push(newsItem);
          });
        })
      );
    });
    await Promise.all(promises);

    setNews(newsArr.reverse());
    setScrollPosition((prev) => prev + 10);
  }

  useEffect(() => {
    getNews();
  }, [totalNewsAmount]);

  async function getNewsAmount() {
    const db = getDatabase();
    const subscriptionsRef = ref(db, "users/" + currentUser!.uid + "/news/");
    const news = await get(subscriptionsRef);
    return news.size;
  }
  useEffect(() => {
    getNewsAmount().then((newsSize) => {
      setTotalNewsAmount(newsSize);
    });
  }, []);
  if (!totalNewsAmount) return null;
  return (
    <div className="page page_centralized container">
      <div className="wall bordered-container">
        <InfiniteScroll
          next={getNews}
          hasMore={totalNewsAmount > scrollPosition - 10}
          loader={<Loader></Loader>}
          dataLength={news.length}
        >
          {news.map((item) => {
            console.log(totalNewsAmount > scrollPosition - 10);
            console.log(scrollPosition);
            return <Post key={item.createdAt} {...item}></Post>;
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
}
