package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.DownloadDateRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.Comparator;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class RoomRepositoryTests {

    @Autowired
    public RoomRepository roomRepository;
    @Autowired
    public DownloadDateRepository downloadDateRepository;
    @Autowired
    public ChatService chatService;
    @Autowired
    public JdbcTemplate jdbcTemplate;
    @Autowired
    public TestDbHelper testDbHelper;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0"), "user0 desc"),
                    UserEntity.of(Username.of("user1"), "user1 desc"),
                    UserEntity.of(Username.of("user2"), "user2 desc"),
                    UserEntity.of(Username.of("user3"), "user3 desc"),
                    UserEntity.of(Username.of("user4"), "user4 desc"),
                    UserEntity.of(Username.of("user5"), "user5 desc"),
            };

    public UserEntity loggedInUser = users[0]; // user0

    public RoomEntity general = RoomEntity.general();
    public String generalDesc = "Generale";

    public ChatMessageDto[] messageDtos =
            {ChatMessageDto.of("1 Hello general from user0", users[0].getName().value()),
                    ChatMessageDto.of("2 Visible only to user0 and user1", users[1].getName().value()),
                    ChatMessageDto.of("3 Visible only to user1 and user2", users[1].getName().value()),
                    ChatMessageDto.of("4 Visible only to user0 and user2", users[2].getName().value()),
                    ChatMessageDto.of("5 Visible only to user0 and user1", users[0].getName().value()),
                    ChatMessageDto.of("6 Visible only to user1 and user2", users[2].getName().value()),
                    ChatMessageDto.of("7 Hello general from user1", users[1].getName().value())

            };

    @BeforeAll
    void setUpAll() {
        testDbHelper.clearDbExceptForGeneral();

        testDbHelper.addUsers(users);

        List<Pair<UserEntity, UserEntity>> pairs = List.of(
                Pair.of(users[0], users[1]),
                Pair.of(users[0], users[2]),
                Pair.of(users[1], users[2]),
                Pair.of(users[0], users[3])
        );

        testDbHelper.addPrivateRoomsAndSubscribeUsers(pairs);

        chatService.saveMessageInDb(messageDtos[0], users[0].getName(), general.getName(), null);
        chatService.saveMessageInDb(messageDtos[1], users[0].getName(), RoomName.of("user0-user1"), users[0].getName());
        chatService.saveMessageInDb(messageDtos[2], users[2].getName(), RoomName.of("user1-user2"), users[2].getName());
        chatService.saveMessageInDb(messageDtos[3], users[0].getName(), RoomName.of("user0-user2"), users[0].getName());
        chatService.saveMessageInDb(messageDtos[4], users[1].getName(), RoomName.of("user0-user1"), users[1].getName());
        chatService.saveMessageInDb(messageDtos[5], users[1].getName(), RoomName.of("user1-user2"), users[1].getName());
    }

    @AfterEach
    void tearDown() {
        jdbcTemplate.update("DELETE FROM infolab.chatmessages WHERE content = '7 Hello general from user1'");
    }

    @Test
    void whenFetchingARoom_forPublicDescriptionIsFromTheDb_forPrivateTheDescriptionIsTheOtherUserOfTheRoom() {
        RoomEntity roomPublic = roomRepository.getByRoomName(general.getName(), loggedInUser.getName()).orElse(null);

        String descriptionPublic = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                (rs, rowNum) -> rs.getString("description"),
                general.getName().value());

        Assertions.assertEquals(generalDesc, roomPublic.getDescription());
        Assertions.assertEquals(descriptionPublic, roomPublic.getDescription());

        RoomEntity roomPrivate = roomRepository.getByRoomName(RoomName.of("user0-user1"), loggedInUser.getName()).orElse(null);

        String descriptionPrivate = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                (rs, rowNum) -> rs.getString("description"),
                general.getName().value());

        Assertions.assertNotEquals(descriptionPrivate, roomPrivate.getDescription());
        Assertions.assertEquals("user1 desc", roomPrivate.getDescription());
    }

    @Test
    void whenFetchingAllRooms_forPublicDescriptionIsFromTheDb_forPrivateTheDescriptionIsTheOtherUserOfTheRoom() {
        List<RoomEntity> roomEntities = roomRepository.getAllRoomsAndLastMessageEvenIfNullInPublicRooms(loggedInUser.getName())
                .stream()
                .sorted(Comparator.comparing(roomEntity -> roomEntity.getName().value()))
                .toList();

        Assertions.assertEquals(3, roomEntities.size());

        String descriptionGeneral = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                (rs, rowNum) -> rs.getString("description"),
                general.getName().value());

        Assertions.assertEquals(generalDesc, roomEntities.get(0).getDescription());
        Assertions.assertEquals(descriptionGeneral, roomEntities.get(0).getDescription());

        String descriptionUser0User1 = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                (rs, rowNum) -> rs.getString("description"),
                "user0-user1");

        Assertions.assertNotEquals(descriptionUser0User1, roomEntities.get(1).getDescription());
        Assertions.assertEquals("user1 desc", roomEntities.get(1).getDescription());

        String descriptionUser0User2 = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                (rs, rowNum) -> rs.getString("description"),
                "user0-user2");

        Assertions.assertNotEquals(descriptionUser0User2, roomEntities.get(2).getDescription());
        Assertions.assertEquals("user2 desc", roomEntities.get(2).getDescription());
    }

    @Test
    void whenFetchingAllRooms_unreadMessagesCount_isCorrect() {
        List<RoomEntity> roomEntities = roomRepository.getAllRoomsAndLastMessageEvenIfNullInPublicRooms(loggedInUser.getName())
                .stream()
                .sorted(Comparator.comparing(roomEntity -> roomEntity.getName().value()))
                .toList();

        Assertions.assertEquals(3, roomEntities.size());

        Assertions.assertEquals(1, roomEntities.get(0).getNotDownloadedMessagesCount()); // General

        Assertions.assertEquals(2, roomEntities.get(1).getNotDownloadedMessagesCount()); // user0-user1

        Assertions.assertEquals(1, roomEntities.get(2).getNotDownloadedMessagesCount()); // user0-user2

        downloadDateRepository.addWhereNotDownloadedYetForUser(loggedInUser.getName(), general.getName());
        downloadDateRepository.addWhereNotDownloadedYetForUser(loggedInUser.getName(), RoomName.of("user0-user1"));

        roomEntities = roomRepository.getAllRoomsAndLastMessageEvenIfNullInPublicRooms(loggedInUser.getName())
                .stream()
                .sorted(Comparator.comparing(roomEntity -> roomEntity.getName().value()))
                .toList();

        Assertions.assertEquals(3, roomEntities.size());

        Assertions.assertEquals(0, roomEntities.get(0).getNotDownloadedMessagesCount()); // General

        Assertions.assertEquals(0, roomEntities.get(1).getNotDownloadedMessagesCount()); // user0-user1

        Assertions.assertEquals(1, roomEntities.get(2).getNotDownloadedMessagesCount()); // user0-user2

        chatService.saveMessageInDb(messageDtos[6], users[0].getName(), general.getName(), null);

        roomEntities = roomRepository.getAllRoomsAndLastMessageEvenIfNullInPublicRooms(loggedInUser.getName())
                .stream()
                .sorted(Comparator.comparing(roomEntity -> roomEntity.getName().value()))
                .toList();

        Assertions.assertEquals(3, roomEntities.size());

        Assertions.assertEquals(1, roomEntities.get(0).getNotDownloadedMessagesCount()); // General

        Assertions.assertEquals(0, roomEntities.get(1).getNotDownloadedMessagesCount()); // user0-user1

        Assertions.assertEquals(1, roomEntities.get(2).getNotDownloadedMessagesCount()); // user0-user2
    }

    @Test
    void whenFetchingPrivateRoom_otherUserIsTheExpectedOne() {
        List<RoomEntity> roomsFromDb = roomRepository.getAllRoomsAndLastMessageEvenIfNullInPublicRooms(loggedInUser.getName())
                .stream()
                .sorted(Comparator.comparing(roomEntity -> roomEntity.getName().value()))
                .toList();

        Assertions.assertEquals("user1", roomsFromDb.get(1).getOtherParticipants().get(0).getName().value());
        Assertions.assertEquals("user2", roomsFromDb.get(2).getOtherParticipants().get(0).getName().value());
    }

    @Test
    void whenFetchingAllRoomsAndUsers_usersAreOfTheExpectedFormat() {
        List<RoomEntity> roomsFromDb = roomRepository.getExistingRoomsAndUsersWithoutRoomAsRooms(null, loggedInUser.getName())
                .stream()
                .sorted(Comparator.comparing(roomEntity -> roomEntity.getName().value()))
                .toList();

        Assertions.assertEquals(6, roomsFromDb.size());

        RoomEntity user4AsRoom = roomsFromDb.get(4);
        Assertions.assertEquals("user4", user4AsRoom.getName().value());
        Assertions.assertEquals("user4 desc", user4AsRoom.getDescription());
        Assertions.assertEquals("user4", user4AsRoom.getOtherParticipants().get(0).getName().value());
        Assertions.assertEquals("user4 desc", user4AsRoom.getOtherParticipants().get(0).getDescription());

        RoomEntity user5AsRoom = roomsFromDb.get(5);
        Assertions.assertEquals("user5", user5AsRoom.getName().value());
        Assertions.assertEquals("user5 desc", user5AsRoom.getDescription());
        Assertions.assertEquals("user5", user5AsRoom.getOtherParticipants().get(0).getName().value());
        Assertions.assertEquals("user5 desc", user5AsRoom.getOtherParticipants().get(0).getDescription());
    }

    @Test
    void whenFetchingAllRoomsAndUsers_forPublicDescriptionIsFromTheDb_forPrivateTheDescriptionIsTheOtherUserOfTheRoom() {
        List<RoomEntity> roomEntities = roomRepository.getExistingRoomsAndUsersWithoutRoomAsRooms(null, loggedInUser.getName())
                .stream()
                .sorted(Comparator.comparing(roomEntity -> roomEntity.getName().value()))
                .toList();

        Assertions.assertEquals(6, roomEntities.size());

        String descriptionGeneral = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                (rs, rowNum) -> rs.getString("description"),
                general.getName().value());

        Assertions.assertEquals(generalDesc, roomEntities.get(0).getDescription());
        Assertions.assertEquals(descriptionGeneral, roomEntities.get(0).getDescription());

        String descriptionUser0User1 = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                (rs, rowNum) -> rs.getString("description"),
                "user0-user1");

        Assertions.assertNotEquals(descriptionUser0User1, roomEntities.get(1).getDescription());
        Assertions.assertEquals("user1 desc", roomEntities.get(1).getDescription());

        String descriptionUser0User2 = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                (rs, rowNum) -> rs.getString("description"),
                "user0-user2");

        Assertions.assertNotEquals(descriptionUser0User2, roomEntities.get(2).getDescription());
        Assertions.assertEquals("user2 desc", roomEntities.get(2).getDescription());

        String descriptionUser0User3 = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                (rs, rowNum) -> rs.getString("description"),
                "user0-user3");

        Assertions.assertNotEquals(descriptionUser0User3, roomEntities.get(3).getDescription());
        Assertions.assertEquals("user3 desc", roomEntities.get(3).getDescription());

        Assertions.assertThrows(EmptyResultDataAccessException.class,
                () -> {
                    String descriptionUser4 = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                            (rs, rowNum) -> rs.getString("description"),
                            "user4");
                });

        Assertions.assertEquals("user4 desc", roomEntities.get(4).getDescription());

        Assertions.assertThrows(EmptyResultDataAccessException.class,
                () -> {
                    String descriptionUser5 = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                            (rs, rowNum) -> rs.getString("description"),
                            "user5");
                });

        Assertions.assertEquals("user5 desc", roomEntities.get(5).getDescription());
    }

    @Test
    void whenFetchingAllRoomsAndUsers_resultIsSortedCorrectly() {
        List<RoomEntity> roomsFromDb = roomRepository.getExistingRoomsAndUsersWithoutRoomAsRooms(null, loggedInUser.getName());

        Assertions.assertEquals(6, roomsFromDb.size());

        Assertions.assertEquals("user0-user2", roomsFromDb.get(0).getName().value());
        Assertions.assertEquals("user0-user1", roomsFromDb.get(1).getName().value());
        Assertions.assertEquals(general.getName().value(), roomsFromDb.get(2).getName().value());
        Assertions.assertEquals("user0-user3", roomsFromDb.get(3).getName().value());
        Assertions.assertEquals("user4", roomsFromDb.get(4).getName().value());
        Assertions.assertEquals("user5", roomsFromDb.get(5).getName().value());
    }
}
