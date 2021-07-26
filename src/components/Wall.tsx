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

export default function Wall({ fullName, photoUrl, userId }: UserDataWithId) {
  const { currentUser } = useAuth();

  const [posts, setPosts] = useState<PostProps[]>([]);

  const isMine = currentUser!.uid === userId;
  const db = getDatabase();

  function watchPosts() {
    const postsRef = ref(db, "users/" + userId + "/posts/");
    onValue(postsRef, (snapshot) => {
      let posts: PostProps[] = [];
      const promises: Promise<void | DataSnapshot>[] = [];
      snapshot.forEach((childSnapshot) => {
        const postRef = ref(db, "posts/" + childSnapshot.key);
        promises.push(
          get(postRef).then((snapshot) => {
            const data = snapshot.val();
            data.postId = snapshot.key;
            posts.push(data);
          })
        );
      });
      //firebase не поддерживает сортировку по убыванию
      Promise.all(promises).then(() => setPosts(posts.reverse()));
    });
  }

  useEffect(() => {
    watchPosts();
    return () => {
      off(ref(db, "users/" + userId + "/posts/"));
    };
  }, []);

  return (
    <div className="wall bordered-container">
      {isMine ? <TellYourStory></TellYourStory> : null}

      {posts?.map((item) => (
        <Post
          userName={fullName}
          text={item.text}
          createdAt={item.createdAt}
          postId={item.postId}
          key={item.createdAt}
          photoUrl={photoUrl}
          authorId={item.authorId}
        ></Post>
      ))}
    </div>
  );
}
