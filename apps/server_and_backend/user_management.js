import { getToken, getRefreshToken, getWsToken } from './authenticate.js';
import { PasswordDoNotMatchError } from './errors.js';

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
        const userDocument = await this.database.createNewUserDocument(
            firstName,
            lastName,
            nameDisplayed,
            username,
            password
        );
        console.log('In user_management:', userDocument);
        const userId = userDocument._id;
        const { token, refreshToken } = UserManagement.getNewTokens(userId);
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

    async saveNewWsToken(userId) {
        const user = await this.database.loadUserWithId(userId);
        if (user) {
            const newWsToken = getWsToken({ _id: userId });
            user.wsToken = newWsToken;
            const updatedUser = await this.database.saveUser(user);
            return newWsToken;
        }
    }

    async loadUserWithId(userId) {
        const user = await this.database.loadUserWithId(userId);
        return user;
    }

    async updateUserInfo(userId, firstName, lastName, nameDisplayed, username) {
        const user = await this.database.loadUserWithId(userId);
        if (user) {
            user.firstName = firstName;
            user.lastName = lastName;
            user.nameDisplayed = nameDisplayed;
            user.username = username;
            const userSaved = await this.database.saveUser(user);
            return userSaved;
        }
    }

    async changePassword(userId, oldPassword, newPassword, newPasswordConfirm) {
        if (newPassword !== newPasswordConfirm) {
            throw new PasswordDoNotMatchError('Passwords do not match');
        }
        const user = await this.database.loadUserWithId(userId);
        if (user) {
            try {
                const updatedUser = await this.database.changePassword(user, oldPassword, newPassword);
                return updatedUser;
            } catch (e) {
                throw e;
            }
        }
    }

    async getNotificationCount(userId) {
        let notificationCount;
        try {
            notificationCount = await this.database.getNotificationCount(userId);
        } catch (e) {
            throw e;
        }
        return notificationCount;
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