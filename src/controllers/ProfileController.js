const sequelize = require('sequelize');
const auth = require('../config/auth.json');
const bcrypt = require('bcryptjs');
const PlayerModel = require('../database/models/Player');
const RegisterModel = require('../database/models/Register');
const config = require('config');
const db = require('../database');
const moment = require('moment');
const requestIp = require('request-ip');
const jwt = require('jsonwebtoken');
const functions = require('../modules/functions');


module.exports = {

    async getCountDataProfile(req, res) {
        try {
            const { username } = req.query;

            var profileArrCount = [];
            var friendsArrCount = [];
            var badgesArrCount = [];
            var roomsArrCount = [];
            var groupsArrCount = [];

            if (username && username.length > 0) {
                const getUserIdFromUsername = await db.query("SELECT id FROM players WHERE username = ? LIMIT 1", {
                    replacements: [username], type: sequelize.QueryTypes.SELECT
                });

                if (getUserIdFromUsername.length > 0) {

                    let string = JSON.stringify(getUserIdFromUsername[0].id);
                    let userId = string.replace(/[^0-9]*/g, '');


                    const profileResultFriendsCount = await db.query("SELECT COUNT(user_one_id) AS count FROM messenger_friendships WHERE user_one_id = ?", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    const profileConsultCountBadgesCount = await db.query("SELECT COUNT(player_id) AS count FROM player_badges WHERE player_id = ?", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    const profileConsultCountRoomsCount = await db.query("SELECT COUNT(owner_id) AS count FROM rooms WHERE owner_id = ?", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    const profileConsultCountGroupsCount = await db.query("SELECT COUNT(player_id) AS count FROM group_memberships WHERE player_id = ?", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });


                    for (var a = 0; a < profileResultFriendsCount.length; a++) {
                        friendsArrCount.push(profileResultFriendsCount[a]);
                    }

                    for (var b = 0; b < profileConsultCountBadgesCount.length; b++) {
                        badgesArrCount.push(profileConsultCountBadgesCount[b]);
                    }

                    for (var c = 0; c < profileConsultCountRoomsCount.length; c++) {
                        roomsArrCount.push(profileConsultCountRoomsCount[c]);
                    }

                    for (var d = 0; d < profileConsultCountGroupsCount.length; d++) {
                        groupsArrCount.push(profileConsultCountGroupsCount[d]);
                    }

                    profileArrCount.push({
                        friends: friendsArrCount[0]
                    });

                    profileArrCount.push({
                        badges: badgesArrCount[0]
                    });

                    profileArrCount.push({
                        rooms: roomsArrCount[0]
                    });

                    profileArrCount.push({
                        groups: groupsArrCount[0]
                    });

                    /* ==================================================================================================================== */


                    res.status(200).json({profile: profileArrCount});

                } else {
                    return res.status(200).json({
                        error: true,
                        status_code: 401,
                        message: "Usu??rio n??o encontrado."
                    });
                }
            } else {
                return res.status(200).json({
                    error: true,
                    status_code: 400,
                    message: "Informe o nome do usu??rio."
                });
            }
        } catch (error) {
            return res.status(500).json({ error });
        }
    },

    async getPlayerDataProfile(req, res) {
        try {
            const { username } = req.query;

            var userArr = [];
            var userRelationsShips = [];

            if (username && username.length > 0) {
                const getUserIdFromUsername = await db.query("SELECT id FROM players WHERE username = ? LIMIT 1", {
                    replacements: [username], type: sequelize.QueryTypes.SELECT
                });

                if (getUserIdFromUsername.length > 0) {

                    let string = JSON.stringify(getUserIdFromUsername[0].id);
                    let userId = string.replace(/[^0-9]*/g, '');

                    const user = await functions.getUserFromId(parseInt(userId));
                    const userSettings = await PlayerModel.findByPk(parseInt(userId), { 
                        include: { association: 'getSettingsUser' }
                    });

                    const relationsShips = await db.query("SELECT level,partner FROM player_relationships WHERE player_id = ?", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    if (relationsShips.length > 0) {
                        for (var i = 0; i < relationsShips.length; i++) {
                            const getUsernamePartner = await db.query("SELECT username,figure FROM players WHERE id = ?", {
                                replacements: [ relationsShips[i].partner ], type: sequelize.QueryTypes.SELECT
                            });
    
                            for (var p = 0; p < getUsernamePartner.length; p++) {
                                userRelationsShips.push({
                                    type: relationsShips[i].level,
                                    partner: getUsernamePartner[p].username,
                                    partnerFigure: getUsernamePartner[p].figure,
                                });
                            }
                        }
                    } else {
                        userRelationsShips = null;
                    }

                    userArr.push({
                        username: user.username,
                        motto: user.motto,
                        figure: user.figure,
                        reg_timestamp: parseInt(user.reg_timestamp),
                        online: user.online == '1' && userSettings.getSettingsUser[0].hide_online == '0',
                        userRelationsShips,
                        canOpenAdminpan: user.rank >= config.get('cms_config').staffCheckHkMinimumRank ? true : false,
                        isOwner: user.username === "Laxus" ? true : false
                    })
                } else {
                    return res.status(200).json({
                        error: true,
                        status_code: 401,
                        message: "Usu??rio n??o encontrado."
                    });
                }
            } else {
                return res.status(200).json({
                    error: true,
                    status_code: 400,
                    message: "Informe o nome do usu??rio."
                });
            }

            res.status(200).json(userArr[0]);
        } catch (error) {
            return res.status(500).json({ error });
        }
    },
    async getFavoriteGroup(req, res) {
        try {
            const { username } = req.query;

            var favoriteGroup = [];

            if (username && username.length > 0) {
                const getUserIdFromUsername = await db.query("SELECT id FROM players WHERE username = ? LIMIT 1", {
                    replacements: [username], type: sequelize.QueryTypes.SELECT
                });

                if (getUserIdFromUsername.length > 0) {

                    let string = JSON.stringify(getUserIdFromUsername[0].id);
                    let userId = string.replace(/[^0-9]*/g, '');

                    const consultFavoriteGroup = await db.query("SELECT group_id FROM group_memberships WHERE player_id = ? && group_id != '0'", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    })

                    if (consultFavoriteGroup.length > 0) {
                        for (var i = 0; i < consultFavoriteGroup.length; i++) {
                            const consultDetailsFavoriteGroup = await db.query("SELECT * FROM groups WHERE id = ?", {
                                replacements: [consultFavoriteGroup[i].group_id], type: sequelize.QueryTypes.SELECT
                            });

                            for (var g = 0; g < consultDetailsFavoriteGroup.length; g++) {
                                favoriteGroup.push({
                                    groupName: consultDetailsFavoriteGroup[g].name,
                                    badge: consultDetailsFavoriteGroup[i].badge
                                })
                            }
                        }
                    }
                }
            }

            res.status(200).json(favoriteGroup);
        } catch (error) {
            return res.status(500).json({ error });
        }
    },

    async getBadgesUsed(req, res) {
        try {
            const { username } = req.query;

            var badgesUsed = [];

            if (username && username.length > 0) {
                const getUserIdFromUsername = await db.query("SELECT id FROM players WHERE username = ? LIMIT 1", {
                    replacements: [username], type: sequelize.QueryTypes.SELECT
                });

                if (getUserIdFromUsername.length > 0) {

                    let string = JSON.stringify(getUserIdFromUsername[0].id);
                    let userId = string.replace(/[^0-9]*/g, '');


                    const consultShowedBadges1 = await db.query("SELECT badge_code FROM player_badges WHERE player_id = ? AND slot != 0 LIMIT 0,1", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    const consultShowedBadges2 = await db.query("SELECT badge_code FROM player_badges WHERE player_id = ? AND slot != 0 LIMIT 1,1", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    const consultShowedBadges3 = await db.query("SELECT badge_code FROM player_badges WHERE player_id = ? AND slot != 0 LIMIT 2,1", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    const consultShowedBadges4 = await db.query("SELECT badge_code FROM player_badges WHERE player_id = ? AND slot != 0 LIMIT 3,1", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    const consultShowedBadges5 = await db.query("SELECT badge_code FROM player_badges WHERE player_id = ? AND slot != 0 LIMIT 4,1", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    for (var s = 0; s < consultShowedBadges1.length; s++) {
                        badgesUsed.push(consultShowedBadges1[s])
                    }

                    for (var s = 0; s < consultShowedBadges2.length; s++) {
                        badgesUsed.push(consultShowedBadges2[s])
                    }

                    for (var s = 0; s < consultShowedBadges3.length; s++) {
                        badgesUsed.push(consultShowedBadges3[s])
                    }

                    for (var s = 0; s < consultShowedBadges4.length; s++) {
                        badgesUsed.push(consultShowedBadges4[s])
                    }

                    for (var s = 0; s < consultShowedBadges5.length; s++) {
                        badgesUsed.push(consultShowedBadges5[s])
                    }

                } else {
                    return res.status(200).json({
                        error: true,
                        status_code: 400,
                        message: "Usu??rio n??o encontrado."
                    });
                }
            } else {
                return res.status(200).json({
                    error: true,
                    status_code: 400,
                    message: "Informe o nome do usu??rio."
                });
            }

            res.status(200).json(badgesUsed);
        } catch (error) {
            return res.status(500).json({ error });
        }
    },

    async getAllBadges(req, res) {
        try {
            const { username } = req.query;

            var myBadges = [];

            if (username && username.length > 0) {
                const getUserIdFromUsername = await db.query("SELECT id FROM players WHERE username = ? LIMIT 1", {
                    replacements: [username], type: sequelize.QueryTypes.SELECT
                });

                if (getUserIdFromUsername.length > 0) {

                    let string = JSON.stringify(getUserIdFromUsername[0].id);
                    let userId = string.replace(/[^0-9]*/g, '');

                    const consultMyBadges = await db.query("SELECT badge_code FROM player_badges WHERE player_id = ? AND slot = 0 LIMIT 6", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    for (var s = 0; s < consultMyBadges.length; s++) {
                        myBadges.push(consultMyBadges[s]);
                    }
                } else {
                    return res.status(200).json({
                        error: true,
                        status_code: 400,
                        message: "Usu??rio n??o encontrado."
                    });
                }
            } else {
                return res.status(200).json({
                    error: true,
                    status_code: 400,
                    message: "Informe o nome do usu??rio."
                });
            }

            res.status(200).json(myBadges);
        } catch (error) {
            return res.status(500).json({ error });
        }
    },

    async getAllRooms(req, res) {
        try {
            const { username } = req.query;

            var rooms = [];

            if (username && username.length > 0) {
                const getUserIdFromUsername = await db.query("SELECT id FROM players WHERE username = ? LIMIT 1", {
                    replacements: [username], type: sequelize.QueryTypes.SELECT
                });

                if (getUserIdFromUsername.length > 0) {

                    let string = JSON.stringify(getUserIdFromUsername[0].id);
                    let userId = string.replace(/[^0-9]*/g, '');

                    const profileSettings = await db.query("SELECT profile_picture,profile_cover,home_room FROM player_settings WHERE player_id = ?", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    })

                    const consultProfileRooms = await db.query("SELECT id,name FROM rooms WHERE owner_id = ? AND id != ? LIMIT 5", {
                        replacements: [userId, profileSettings[0].home_room], type: sequelize.QueryTypes.SELECT
                    })

                    for (var s = 0; s < consultProfileRooms.length; s++) {
                        rooms.push({
                            roomName: consultProfileRooms[s].name,
                            roomId: consultProfileRooms[s].id
                        });
                    }
                } else {
                    return res.status(200).json({
                        error: true,
                        status_code: 400,
                        message: "Usu??rio n??o encontrado."
                    });
                }
            } else {
                return res.status(200).json({
                    error: true,
                    status_code: 400,
                    message: "Informe o nome do usu??rio."
                });
            }

            res.status(200).json(rooms);
        } catch (error) {
            return res.status(500).json({ error });
        }
    },

    async getAllGroups(req, res) {
        try {
            const { username } = req.query;

            var groups = [];

            if (username && username.length > 0) {
                const getUserIdFromUsername = await db.query("SELECT id FROM players WHERE username = ? LIMIT 1", {
                    replacements: [username], type: sequelize.QueryTypes.SELECT
                });

                if (getUserIdFromUsername.length > 0) {

                    let string = JSON.stringify(getUserIdFromUsername[0].id);
                    let userId = string.replace(/[^0-9]*/g, '');


                    const consultProfileGroups1 = await db.query("SELECT group_id FROM group_memberships WHERE player_id = ? LIMIT 0,1", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    const consultProfileGroups2 = await db.query("SELECT group_id FROM group_memberships WHERE player_id = ? LIMIT 1,1", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    const consultProfileGroups3 = await db.query("SELECT group_id FROM group_memberships WHERE player_id = ? LIMIT 2,1", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    const consultProfileGroups4 = await db.query("SELECT group_id FROM group_memberships WHERE player_id = ? LIMIT 3,1", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    const consultProfileGroups5 = await db.query("SELECT group_id FROM group_memberships WHERE player_id = ? LIMIT 4,1", {
                        replacements: [userId], type: sequelize.QueryTypes.SELECT
                    });

                    for (var g = 0; g < consultProfileGroups1.length; g++) {
                        const consultGroupInfo = await db.query("SELECT name,badge FROM groups WHERE id = ?", {
                            replacements: [consultProfileGroups1[g].group_id], type: sequelize.QueryTypes.SELECT
                        });

                        for (var c = 0; c < consultGroupInfo.length; c++) {
                            groups.push({
                                groupName: consultGroupInfo[c].name,
                                groupBadge: consultGroupInfo[c].badge,
                            })
                        }
                    }

                    for (var g = 0; g < consultProfileGroups2.length; g++) {
                        const consultGroupInfo = await db.query("SELECT name,badge FROM groups WHERE id = ?", {
                            replacements: [consultProfileGroups1[g].group_id], type: sequelize.QueryTypes.SELECT
                        });

                        for (var c = 0; c < consultGroupInfo.length; c++) {
                            groups.push({
                                groupName: consultGroupInfo[c].name,
                                groupBadge: consultGroupInfo[c].badge,
                            })
                        }
                    }

                    for (var g = 0; g < consultProfileGroups3.length; g++) {
                        const consultGroupInfo = await db.query("SELECT name,badge FROM groups WHERE id = ?", {
                            replacements: [consultProfileGroups1[g].group_id], type: sequelize.QueryTypes.SELECT
                        });

                        for (var c = 0; c < consultGroupInfo.length; c++) {
                            groups.push({
                                groupName: consultGroupInfo[c].name,
                                groupBadge: consultGroupInfo[c].badge,
                            })
                        }
                    }

                    for (var g = 0; g < consultProfileGroups4.length; g++) {
                        const consultGroupInfo = await db.query("SELECT name,badge FROM groups WHERE id = ?", {
                            replacements: [consultProfileGroups1[g].group_id], type: sequelize.QueryTypes.SELECT
                        });

                        for (var c = 0; c < consultGroupInfo.length; c++) {
                            groups.push({
                                groupName: consultGroupInfo[c].name,
                                groupBadge: consultGroupInfo[c].badge,
                            })
                        }
                    }

                    for (var g = 0; g < consultProfileGroups5.length; g++) {
                        const consultGroupInfo = await db.query("SELECT name,badge FROM groups WHERE id = ?", {
                            replacements: [consultProfileGroups1[g].group_id], type: sequelize.QueryTypes.SELECT
                        });

                        for (var c = 0; c < consultGroupInfo.length; c++) {
                            groups.push({
                                groupName: consultGroupInfo[c].name,
                                groupBadge: consultGroupInfo[c].badge,
                            })
                        }
                    }
                } else {
                    return res.status(200).json({
                        error: true,
                        status_code: 400,
                        message: "Usu??rio n??o encontrado."
                    });
                }
            } else {
                return res.status(200).json({
                    error: true,
                    status_code: 400,
                    message: "Informe o nome do usu??rio."
                });
            }

            res.status(200).json(groups);
        } catch (error) {
            return res.status(500).json({ error });
        }
    }

}