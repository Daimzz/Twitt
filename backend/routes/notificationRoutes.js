import {Router} from 'express'
import {protectRoute} from "../middleware/protectRoute.js";
import {deleteNotifications,  getNotifications} from "../controllers/notificationContoller.js";

const route = Router()

route.get('/', protectRoute, getNotifications)
route.delete('/', protectRoute, deleteNotifications)
route.delete('/:id', protectRoute, )

export default route