class WebSocketServerNotif {
    constructor(wss) {
        this.wss = wss
    }


    
    wss.on('connection', async (ws, request) => {
        ws.isAlive = true;
        ws.on('pong', heartbeat);
        let userId;
        let lastNotifCountSent;
    
        ws.on('message', async message => {
            const result = JSON.parse(message);
    
            if (result.userId && result.wsToken) {
                const { userId, wsToken } = result;
                const WsTokenSecret = process.env.WS_TOKEN_SECRET;
                const decodedWsToken = jwt.verify(wsToken, WsTokenSecret);
    
                if (decodedWsToken._id === userId) {
                    const user = await userManagement.loadUserWithId(userId);
                    if (user.wsToken === wsToken) {
                        const notificationCount = await userManagement.getNotificationCount(userId);
                        const messageNotifCount = JSON.stringify({ "notificationCount": notificationCount });
                        ws.send(messageNotifCount);
                        lastNotifCountSent = JSON.parse(messageNotifCount).notificationCount;
                    } else {
                        ws.close();
                    }
                } else {
                    ws.close();
                }
            }
        })
    
        const intervalId = setInterval(sendNewNotifCount, 5000);
    
        ws.on('close', () => {
            console.log('Client disconnected');
            clearInterval(intervalId);
        })
    
        ws.onerror = (error) => {
            console.log('THERE WAS AN ERROR:');
            console.log(error);
        }
    
        async function sendNewNotifCount() {
            if (ws.readyState === 3) return clearInterval(intervalId);
            const newNotifCount = await userManagement.getNotificationCount(userId);
            if (lastNotifCountSent !== newNotifCount) {
                const newMessageNotifCount = JSON.stringify({ "notificationCount": newNotifCount });
                ws.send(newMessageNotifCount);
                lastNotifCountSent = JSON.parse(newMessageNotifCount).notificationCount;
            }
        };
    })
    
    const intervalCloseBrokenWs = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();
    
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);
    
    wss.on('close', function close() {
        clearInterval(intervalCloseBrokenWs);
    });

    heartbeat() {
        this.isAlive = true;
    }

}

export default WebSocketServerNotif