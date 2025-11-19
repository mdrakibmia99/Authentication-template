// chat.routes.ts
import { Router } from 'express';
import auth from '../../middleware/auth';
import { ChatController } from './chat.controller';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
const uploadChatDocument = fileUpload('./public/uploads/chatDocuments');

export const ChatRoutes = Router();
ChatRoutes.post('/upload-chat-document',
    auth(USER_ROLE.GUEST),
    uploadChatDocument.fields([
        { name: 'uploadChatDocument', maxCount: 5 },
    ]),
    ChatController.uploadChatDocument
)
    ;
ChatRoutes.patch('/create-or-fetch-chatId', auth(USER_ROLE.GUEST, USER_ROLE.HOST), ChatController.createOrFetchChat);
ChatRoutes.get('/get-chat-list', auth(USER_ROLE.GUEST, USER_ROLE.HOST, USER_ROLE.ADMIN), ChatController.getChats);
ChatRoutes.get('/:chatId/messages', auth(USER_ROLE.GUEST, USER_ROLE.HOST, USER_ROLE.ADMIN), ChatController.getChatMessages);
