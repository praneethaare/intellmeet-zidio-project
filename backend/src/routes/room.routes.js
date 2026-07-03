import { getMyRooms, joinRoom } from "../controller/joinroom.controller.js";
import { createRoom } from "../controller/roomCreation.controller.js";
import checkAuth from "../middleware/authCheck.middleware.js";
import {Router} from  'express' ;

const Room = Router()

Room.use(checkAuth)
Room.post('/', createRoom)
Room.post('/:roomId/join', joinRoom)
Room.get('/', getMyRooms)

export default Room
