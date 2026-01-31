import express from 'express';
import { getMessageByIdHandler, deleteMessageHandler, updateMessageHandler } from './message.controller.js';

const router = express.Router();

router.get('/:messageId', getMessageByIdHandler)
.delete('/:messageId', deleteMessageHandler)
.put('/:messageId', updateMessageHandler);

export default router;