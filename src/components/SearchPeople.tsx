import {
  getDatabase,
  ref,
  query,
  onValue,
  get,
  orderByChild,
  startAt,
  endAt,
  equalTo,
  limitToLast,
} from "firebase/database";
import React, { ReactElement, useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import UserProfile, { UserData } from "./UserProfile";
import { ChangeEvent } from "react";

export default function SearchPeople() {
  interface usersListData {
    [index: string]: UserData;
  }
  const [usersData, setUsersData] = useState<usersListData | null>(null);
  //просто записать это в переменную и потом использовать не даёт - не рендерит, почему?
  const [usersElementsList, setUsersElementsList] = useState<ReactElement[]>(
    []
  );
  const [totalUsersAmount, setTotalUsersAmount] = useState(0);

  const { currentUser } = useAuth();
  const db = getDatabase();

  // function getArrayOfRandomIndexes(amount = 10) {
  //   if (!totalUsersAmount) return;
  //   const arr: number[] = [];
  //   for (let i = 0; i < amount; i++) {
  //     arr.push(getUniqueIndex(arr));
  //   }
  //   return arr;
  // }

  // function getUniqueIndex(array: number[]): number {
  //   const index = Math.round(Math.random() * totalUsersAmount);
  //   if (array.includes(index)) {
  //     return getUniqueIndex(array);
  //   }
  //   return index;
  // }

  async function getRandomUsers() {
    //kinda appears as random
    //really difficult to handle with firebase
    const keys = ["aboutMe", "fullName", "photoUrl", "whereFrom"];
    const index = Math.floor(Math.random() * keys.length);

    const usersRef = ref(db, "users/");
    console.log(index);

    const searchedByName = query(
      usersRef,
      orderByChild(keys[index]),
      limitToLast(10)
    );

    const snapshot = await get(searchedByName);

    setUsersData(snapshot.val());
  }

  async function searchUsers(e: ChangeEvent<HTMLInputElement>) {
    const queryText = e.target.value.trim().toLowerCase();
    if (!queryText) {
      setUsersElementsList([]);
      return;
    }

    const usersRef = ref(db, "users/");
    const searchedByName = query(
      usersRef,
      orderByChild("fullName"),
      startAt(queryText),
      endAt(queryText + "\uf8ff")
    );
    const byName = await get(searchedByName);
    console.log(byName.val());
    setUsersData({ ...byName.val() });
  }

  function getTotalUsersAmount() {
    const counterRef = ref(db, "counters/users/");
    onValue(
      counterRef,
      (snapshot) => {
        setTotalUsersAmount(snapshot.val());
      },
      { onlyOnce: true }
    );
  }

  useEffect(() => {
    getTotalUsersAmount();
  }, []);

  useEffect(() => {
    if (!totalUsersAmount) return;

    getRandomUsers();
  }, [totalUsersAmount]);

  useEffect(() => {
    if (usersData) {
      const list = [];
      for (const [key, values] of Object.entries(usersData)) {
        if (key === currentUser!.uid) {
          continue;
        }
        let profile = (
          <Link className="search__link" key={key} to={"/" + key}>
            <UserProfile key={key} userId={key} {...values}></UserProfile>
          </Link>
        );
        list.push(profile);
      }
      setUsersElementsList(list);
    }
  }, [usersData]);

  return (
    <div className="page page_centralized container">
      <div className="search bordered-container glassed-container">
        <div className="people-search__header section-header stone-bordered">
          <input
            onChange={searchUsers}
            className="form__input input_white-border"
            type="text"
          ></input>
          <span>search</span>
        </div>
        {usersElementsList.map((item) => {
          return item;
        })}
      </div>
    </div>
  );
}
