// chat.controller.ts
import { Request, Response } from 'express';
import { ChatService } from './chat.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { IJwtPayload } from '../auth/auth.interface';
import { storeFiles } from '../../utils/fileHelper';
import AppError from '../../error/AppError';



const uploadChatDocument = catchAsync(async (req: Request, res: Response) => {

    if (req.files && Object.keys(req?.files).length > 0) {
        try {
            // Use storeFiles to process all uploaded files
            const filePaths = storeFiles(
                'chatDocuments',
                req.files as { [fieldName: string]: Express.Multer.File[] },
            );
            console.log(filePaths, "file path")
            // Set image (single file)
            if (filePaths.uploadChatDocument && filePaths.uploadChatDocument.length > 0) {
                req.body.documents = filePaths.uploadChatDocument; // Assign first image
            }
        } catch (error: any) {
            console.error('Error processing files:', error.message);
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'Failed to process uploaded files',
                data: null,
            });
        }
    } else {
        throw new AppError(httpStatus.BAD_REQUEST, 'Please upload at least one document');
    }
    const chat = await ChatService.uploadChatDocument(req.body.documents);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'chat document uploaded successfully',
        data: chat,
    });
}
)
const createOrFetchChat = catchAsync(
    async (req: Request, res: Response) => {
        const chat = await ChatService.getOrCreateChat(
            req.user as IJwtPayload,
            req.body.targetId
        );
        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'create or fetch chat successfully',
            data: chat,
        });
    }
)



const getChats = catchAsync(
    async (req: Request, res: Response) => {

        const chats = await ChatService.getUserChats(req.user as IJwtPayload, req.query);
        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'get chat user successfully',
            data: chats,
        });
    }
);

const getChatMessages = catchAsync(
    async (req: Request, res: Response) => {
        const { chatId } = req.params;
        const msgs = await ChatService.getMessages(req.user as IJwtPayload, chatId, req.query);
        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'get chat message successfully',
            data: msgs,
        });
    }
);

export const ChatController = { createOrFetchChat, getChats, getChatMessages, uploadChatDocument };

