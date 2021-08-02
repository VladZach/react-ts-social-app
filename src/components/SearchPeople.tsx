import {
  getDatabase,
  ref,
  query,
  limitToFirst,
  get,
  orderByChild,
  startAt,
  endAt,
} from "firebase/database";
import React, { ReactElement, useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "./Loader";
import UserProfile, { UserData } from "./UserProfile";
import { ChangeEvent } from "react";
import { isTypeReferenceNode } from "typescript";

export default function SearchPeople() {
  interface usersListData {
    [index: string]: UserData;
  }
  const [usersData, setUsersData] = useState<usersListData | null>(null);
  //просто записать это в переменную и потом использовать не даёт - не рендерит, почему?
  const [usersElementsList, setUsersElementsList] = useState<ReactElement[]>(
    []
  );

  const { currentUser } = useAuth();

  async function searchUsers(e: ChangeEvent<HTMLInputElement>) {
    const queryText = e.target.value.trim().toLowerCase();
    if (!queryText) {
      console.log(3);
      setUsersData(null);
      return;
    }
    const db = getDatabase();
    const usersRef = ref(db, "users/");
    const searchedByName = query(
      usersRef,
      orderByChild("fullName"),
      startAt(queryText),
      endAt(queryText + "\uf8ff")
    );
    const byName = await get(searchedByName);
    setUsersData({ ...byName.val() });
  }

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
