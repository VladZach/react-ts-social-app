import React, { useState, useEffect, useRef } from "react";
import Post, { PostProps } from "./Post";
import TellYourStory from "./TellYourStory";
import { useAuth } from "../contexts/AuthContext";
import {
  getDatabase,
  ref,
  onValue,
  off,
  get,
  DataSnapshot,
} from "firebase/database";
import { UserDataWithId } from "./UserProfile";
import InfiniteScroll from "react-infinite-scroll-component";
import Loader from "./Loader";

export default function Wall({ fullName, photoUrl, userId }: UserDataWithId) {
  //храним все посты, полученые с помощью watchPosts
  const [posts, setPosts] = useState<PostProps[]>([]);

  const { currentUser } = useAuth();
  const isMine = currentUser!.uid === userId;
  const db = getDatabase();
  const postsPerScroll = 10;

  //показываем только эту часть постов
  const [postsToShow, setPostsToShow] = useState<PostProps[]>([]);
  const [amountOfPostsToShow, setAmountOfPostsToShow] =
    useState(postsPerScroll);

  function watchPosts() {
    const postsRef = ref(db, "users/" + userId + "/posts/");
    onValue(postsRef, (snapshot) => {
      let posts: PostProps[] = [];
      const promises: Promise<void | DataSnapshot>[] = [];
      snapshot.forEach((childSnapshot) => {
        const postRef = ref(db, "posts/" + childSnapshot.key);
        promises.push(
          get(postRef).then((snapshot) => {
            const post = snapshot.val();
            post.postId = snapshot.key;
            posts.push(post);
          })
        );
      });
      //firebase не поддерживает сортировку по убыванию
      Promise.all(promises).then(() => setPosts(posts.reverse()));
    });
  }

  function getPostsForScroll(isCalledByNext: boolean) {
    if (isCalledByNext) {
      const amount = amountOfPostsToShow + postsPerScroll;
      setAmountOfPostsToShow(amount);
      setPostsToShow(posts.slice(0, amount));
    } else {
      setPostsToShow(posts.slice(0, amountOfPostsToShow));
    }
  }

  useEffect(() => {
    watchPosts();
    return () => {
      off(ref(db, "users/" + userId + "/posts/"));
    };
  }, []);

  useEffect(() => {
    getPostsForScroll(false);
  }, [posts]);

  return (
    <div className="wall bordered-container">
      {isMine ? <TellYourStory></TellYourStory> : null}
      <InfiniteScroll
        next={getPostsForScroll.bind(null, true)}
        hasMore={posts.length > postsToShow.length}
        loader={<Loader></Loader>}
        dataLength={postsToShow.length}
      >
        {postsToShow.map((item) => {
          return (
            <Post
              userName={fullName}
              createdAt={item.createdAt}
              postId={item.postId}
              key={item.createdAt}
              photoUrl={photoUrl}
              authorId={item.authorId}
            ></Post>
          );
        })}
      </InfiniteScroll>
    </div>
  );
}
