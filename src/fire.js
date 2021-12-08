/* eslint-disable */
import { initializeApp } from 'firebase/app';

import { getDatabase, ref, child, get} from "firebase/database";
const config = {
  apiKey: "AIzaSyCxQCOlsGT7Um-nBH1HETTMa3CD8RmTVyY",
  authDomain: "oneline-9a9e1.firebaseapp.com",
  databaseURL: "https://oneline-9a9e1-default-rtdb.firebaseio.com/",
  projectId: "oneline-9a9e1",
  storageBucket: "oneline-9a9e1.appspot.com",
  messagingSenderId: "1024167995665",
  appId: "1:1024167995665:web:699168f6c4981b64dd84b0"
};

var fire = initializeApp(config);
const db = getDatabase(fire);
export default db;
