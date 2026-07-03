/**
 * @swagger
 * tags:
 *   name: WebSockets
 *   description: Socket.IO events documentation (Note - OpenAPI is REST-focused, so these are event references, not HTTP endpoints)
 */

/**
 * @swagger
 * /socket.io-events:
 *   get:
 *     summary: Socket.IO Event Reference
 *     description: Documentation for frontend developers on how to interact with the Socket.IO server.
 *     tags: [WebSockets]
 *     responses:
 *       101:
 *         description: Switching Protocols to WebSockets.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Client_to_Server_Events:
 *                   type: object
 *                   properties:
 *                     join-room:
 *                       type: string
 *                       description: "Emitted by client to join a specific room. Arguments: (user: string, roomId: string, email: string)"
 *                     leave-room:
 *                       type: string
 *                       description: "Emitted by client to leave a specific room. Arguments: (userId: string, roomId: string)"
 *                 Server_to_Client_Events:
 *                   type: object
 *                   properties:
 *                     user-joined:
 *                       type: string
 *                       description: "Received by other clients in the room when a new user joins."
 *                     room-connected:
 *                       type: string
 *                       description: "Received by the joining client as confirmation of successful join."
 *                     user-left:
 *                       type: string
 *                       description: "Received by other clients in the room when a user leaves."
 */