import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateLayout from './PrivateLayout';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Home  from '../pages/Home';
import ComposeTweet from '../pages/ComposeTweet';
import  Following  from '../pages/Following';
import  Followers  from '../pages/Followers';
import UserTweets from '../pages/UserTweets';
import Feed from '../pages/Feed';


export default function BaseRouter() {
  return (
    <>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route element={<PrivateLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/tweet/new" element={<ComposeTweet />} />
              <Route path="/following" element={<Following />} />
              <Route path="/followers" element={<Followers />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/users/:username" element={<UserTweets />} />
            </Route>

            <Route path="/*" element={<Navigate to="/" replace />} />
          </Routes>
      </>
  )
}