package com.cgm.infolab;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.CursorEnum;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.templates.RepositoryTestTemplate;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class LastDownloadedDatesForRoomsTests extends RepositoryTestTemplate {

    @Autowired
    public RoomRepository roomRepository;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0")),
                    UserEntity.of(Username.of("user1")),
                    UserEntity.of(Username.of("user2")),
                    UserEntity.of(Username.of("user3"))};

    public RoomEntity general = RoomEntity.general();

    public static final LocalDateTime STARTING_TIME = LocalDateTime.of(2023, 6, 1, 1, 1, 1);

    public Long generalId;
    public Long user0user1Id;
    public RoomName user0Uuser1RoomName = RoomName.of("user0-user1");
    public Long loggedInUserId;

    public ChatMessageDto[] messageDtos =
            {ChatMessageDto.of("0 Hello general from user0", users[0].getName().value()),
            ChatMessageDto.of("1 Hello general from user0", users[1].getName().value()),
            ChatMessageDto.of("2 Hello general from user0", users[1].getName().value()),
            ChatMessageDto.of("3 Hello general from user0", users[1].getName().value()),

            ChatMessageDto.of("4 Visible only to user0 and user1", users[1].getName().value()),
            ChatMessageDto.of("5 Visible only to user0 and user1", users[0].getName().value()),
            };

    @Override
    @BeforeAll
    protected void setUp() {
        super.setUp();

        testDbHelper.addRooms(RoomEntity.general());

        testDbHelper.addUsers(users);

        List<Pair<UserEntity, UserEntity>> pairs = List.of(
                Pair.of(users[0], users[1]),
                Pair.of(users[0], users[2]),
                Pair.of(users[1], users[2]),
                Pair.of(users[0], users[3])
        );

        testDbHelper.addPrivateRoomsAndSubscribeUsers(pairs);

        generalId = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = 'general'", (rs, rowNum) -> rs.getLong("id"));
        user0user1Id = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = 'user0-user1'", (rs, rowNum) -> rs.getLong("id"));

        loggedInUserId = jdbcTemplate.queryForObject("select * from infolab.users where username = 'user0'", (rs, rowNum) -> rs.getLong("id"));

        // Adding messages and read dates
        testDbHelper.insertCustomMessage(0, users[0].getName().value(), general.getName().value(), STARTING_TIME, messageDtos[0].getContent());
        testDbHelper.insertCustomMessage(1, users[0].getName().value(), general.getName().value(), STARTING_TIME.plusSeconds(1), messageDtos[1].getContent());

        testDbHelper.insertCustomMessage(2, users[0].getName().value(), user0Uuser1RoomName.value(), STARTING_TIME.plusSeconds(2), messageDtos[4].getContent());
        testDbHelper.insertCustomMessage(3, users[0].getName().value(), user0Uuser1RoomName.value(), STARTING_TIME.plusSeconds(3), messageDtos[5].getContent());

        testDbHelper.insertCustomReadDate(STARTING_TIME.plusSeconds(10), 0, users[0].getName().value());
        testDbHelper.insertCustomReadDate(STARTING_TIME.plusSeconds(11), 1, users[0].getName().value());

        testDbHelper.insertCustomReadDate(STARTING_TIME.plusSeconds(20), 2, users[0].getName().value());
        testDbHelper.insertCustomReadDate(STARTING_TIME.plusSeconds(21), 3, users[0].getName().value());

        // Adding the remaining messages
        testDbHelper.insertCustomMessage(4, users[0].getName().value(), general.getName().value(), STARTING_TIME.plusSeconds(4), messageDtos[2].getContent());
        testDbHelper.insertCustomMessage(5, users[0].getName().value(), general.getName().value(), STARTING_TIME.plusSeconds(5), messageDtos[3].getContent());

        testDbHelper.insertCustomMessage(6, users[1].getName().value(), "user1-user2", STARTING_TIME.plusSeconds(6), "1 Message not accessible to user0");

        testDbHelper.insertCustomReadDate(STARTING_TIME.plusSeconds(7), 6, users[1].getName().value());

        testDbHelper.insertCustomMessage(7, users[1].getName().value(), "user1-user2", STARTING_TIME.plusSeconds(8), "2 Message not accessible to user0");
    }

    @Test
    void whenFetchingLastReadDates_fromGeneralAndFromPrivateRoom_theyAreTheExpectedOnes() {
        Map<RoomName, LocalDateTime> downloadDatesUser0 = roomRepository.getLastDownloadedDatesGroupedByRoom(List.of(general.getName(), user0Uuser1RoomName), users[0].getName());

        Assertions.assertEquals(2, downloadDatesUser0.size());

        Assertions.assertEquals(STARTING_TIME.plusSeconds(11), downloadDatesUser0.get(general.getName()));
        Assertions.assertEquals(STARTING_TIME.plusSeconds(21), downloadDatesUser0.get(user0Uuser1RoomName));

        Map<RoomName, LocalDateTime> downloadDatesUser1 = roomRepository.getLastDownloadedDatesGroupedByRoom(List.of(general.getName(), user0Uuser1RoomName), users[1].getName());

        Assertions.assertEquals(0, downloadDatesUser1.size());
    }

    @Test
    void whenFetchingRooms_lastReadDates_areTheExpectedOnes() {
        List<RoomEntity> roomEntities = roomRepository.getExistingRoomsAndUsersWithoutRoomAsRooms(-1, CursorEnum.NONE, null, users[0].getName());

        Assertions.assertEquals(4, roomEntities.size());

        RoomEntity roomGeneral = roomEntities
                .stream()
                .filter((roomEntity -> roomEntity.getName().value().equals("general")))
                .toList()
                .get(0);

        RoomEntity roomUser0User1 = roomEntities
                .stream()
                .filter((roomEntity -> roomEntity.getName().value().equals("user0-user1")))
                .toList()
                .get(0);

        Assertions.assertEquals(STARTING_TIME.plusSeconds(11), roomGeneral.getLastDownloadedDate());
        Assertions.assertEquals(STARTING_TIME.plusSeconds(21), roomUser0User1.getLastDownloadedDate());
    }

    @Test
    void whenFetchingDownloadInfo_fromGeneralRoom_theyAreTheExpectedOnes() {
        RoomEntity room = roomRepository.getDownloadInfoAsEmptyRoom(general.getName(), users[0].getName());

        Assertions.assertEquals(STARTING_TIME.plusSeconds(11), room.getLastDownloadedDate());
        Assertions.assertEquals(2, room.getNotDownloadedMessagesCount());
    }

    @Test
    void whenFetchingDownloadInfo_forRoomTheUserHasNotAccessTo_illegalArgumentExceptionIsThrown() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            RoomEntity room = roomRepository.getDownloadInfoAsEmptyRoom(RoomName.of("user1-user2"), users[0].getName());
        });
    }

    @Test
    void whenFetchingDownloadInfo_forNotExistingRoom_illegalArgumentExceptionIsThrown() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            RoomEntity room = roomRepository.getDownloadInfoAsEmptyRoom(RoomName.of("user0-user4"), users[0].getName());
        });
    }
}
