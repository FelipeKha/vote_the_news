import { getToken, getRefreshToken } from './authenticate.js';

class UserManagement {
    constructor(database) {
        this.database = database;
    }

    async registerNewUser(
        firstName,
        lastName,
        nameDisplayed,
        username,
        password
    ) {
        const userDocument = this.database.createNewUserDocument(
            firstName,
            lastName,
            nameDisplayed,
            username,
            password
        );
        const userId = userDocument._id;
        const { token, refreshToken } = UserManagement.getNewTokens(userId);
        // const token = getToken({ _id: userDocument._id });
        // const refreshToken = getRefreshToken({ _id: userDocument._id });
        userDocument.refreshToken.push({ refreshToken });
        const user = await this.database.saveUser(userDocument)
        return { user: user, token: token, refreshToken: refreshToken };
    }

    async loginUser(userId) {
        const user = await this.database.loadUserWithId(userId);
        const { token, refreshToken } = UserManagement.getNewTokens(userId);
        // const token = getToken({ _id: userId });
        // const refreshToken = getRefreshToken({ _id: userId })
        user.refreshToken.push({ refreshToken });
        const userSaved = await this.database.saveUser(user);
        return { user: userSaved, token: token, refreshToken: refreshToken };
    }

    async logoutUser(userId, refreshToken) {
        const user = await this.database.loadUserWithId(userId);
        if (user) {
            const refreshTokenIndex = UserManagement.getRefreshTokenIndex(user, refreshToken);
            // const refreshTokenIndex = user.refreshToken.findIndex(
            //     item => item.refreshToken === refreshToken
            // )
            if (refreshTokenIndex !== -1) {
                user.refreshToken.id(user.refreshToken[refreshTokenIndex]._id).remove()
            }
            const userSaved = await this.database.saveUser(user);
        }
    }

    async saveNewRefreshToken(user, refreshToken) {
        const refreshTokenIndex = UserManagement.getRefreshTokenIndex(user, refreshToken);
        if (refreshTokenIndex !== -1) {
            const { token: newToken, refreshToken: newRefreshToken } = UserManagement.getNewTokens(user._id);
            user.refreshToken[refreshTokenIndex] = { refreshToken: newRefreshToken };
            const updatedUser = await this.database.saveUser(user);
            return { updatedUser, newToken, newRefreshToken };
        }
    }

    async loadUserWithId(userId) {
        const user = await this.database.loadUserWithId(userId);
        return user;
    }

    static getNewTokens(userId) {
        const token = getToken({ _id: userId });
        const refreshToken = getRefreshToken({ _id: userId });
        return { token, refreshToken };
    }

    static getRefreshTokenIndex(user, refreshToken) {
        const refreshTokenIndex = user.refreshToken.findIndex(
            item => item.refreshToken === refreshToken
        )
        return refreshTokenIndex;
    }
}

export default UserManagement;