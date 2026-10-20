import { Routes, Route, Navigate } from "react-router-dom"
import { Register } from "../pages/Register"
import { Login } from "../pages/Login"
import { Home } from "../pages/Home"
import { ComposeTweet } from "../pages/ComposeTweet"
import { Following } from "../pages/Following"
import { Followers } from "../pages/Followers"
import { UserTweets } from "../pages/UserTweets"
import { Feed } from "../pages/Feed"


export const BaseRouter = () => {
  return (
    <>
        <Routes>
            <Route path="/register" element={ <Register /> }/>
            <Route path="/login" element={ <Login /> }/>
            <Route path="/" element={ <Home /> }/>
            <Route path="/tweet/new" element={ <ComposeTweet /> }/>
            <Route path="/following" element={ <Following /> }/>
            <Route path="/followers" element={ <Followers /> }/>
            <Route path="/feed" element={ <Feed /> }/>
            <Route path="/users/:username" element={ <UserTweets /> }/>

            <Route path="/*" element={ <Navigate to={"/"} /> }/> 
        </Routes>
    </>
  )
}