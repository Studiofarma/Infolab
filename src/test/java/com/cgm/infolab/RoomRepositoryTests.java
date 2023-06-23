package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import com.cgm.infolab.service.RoomService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.Comparator;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class RoomRepositoryTests {

    @Autowired
    public ChatMessageRepository chatMessageRepository;
    @Autowired
    public RoomRepository roomRepository;
    @Autowired
    public UserRepository userRepository;
    @Autowired
    public RoomService roomService;
    @Autowired
    public ChatService chatService;
    @Autowired
    public JdbcTemplate jdbcTemplate;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0")),
                    UserEntity.of(Username.of("user1")),
                    UserEntity.of(Username.of("user2")),
                    UserEntity.of(Username.of("user3"))};

    public UserEntity loggedInUser = users[0]; // user0

    public RoomEntity general = RoomEntity.general();
    public String generalDesc = "Generale";
    public RoomEntity anotherPublic = RoomEntity.of(RoomName.of("public2"), VisibilityEnum.PUBLIC);

    public ChatMessageDto[] messageDtos =
            {ChatMessageDto.of("1 Hello general from user0", users[0].getName().value()),
                    ChatMessageDto.of("2 Visible only to user0 and user1", users[1].getName().value()),
                    ChatMessageDto.of("3 Visible only to user1 and user2", users[1].getName().value()),
                    ChatMessageDto.of("4 Visible only to user0 and user2", users[2].getName().value()),
                    ChatMessageDto.of("5 Visible only to user0 and user1", users[0].getName().value()),
                    ChatMessageDto.of("6 Visible only to user1 and user2", users[2].getName().value())};

    @BeforeAll
    void setUpAll() {
        jdbcTemplate.update("DELETE FROM infolab.download_dates");
        jdbcTemplate.update("DELETE FROM infolab.chatmessages");
        jdbcTemplate.update("DELETE FROM infolab.rooms_subscriptions");
        jdbcTemplate.update("DELETE FROM infolab.users");
        jdbcTemplate.update("DELETE FROM infolab.rooms WHERE roomname <> 'general'");

        for (UserEntity user : users) {
            userRepository.add(user);
        }

        roomService.createPrivateRoomAndSubscribeUsers(users[0].getName(), users[1].getName());
        roomService.createPrivateRoomAndSubscribeUsers(users[0].getName(), users[2].getName());
        roomService.createPrivateRoomAndSubscribeUsers(users[1].getName(), users[2].getName());
        roomService.createPrivateRoomAndSubscribeUsers(users[0].getName(), users[3].getName());

        chatService.saveMessageInDb(messageDtos[0], users[0].getName(), general.getName(), null);
        chatService.saveMessageInDb(messageDtos[1], users[0].getName(), RoomName.of("user0-user1"), users[0].getName());
        chatService.saveMessageInDb(messageDtos[2], users[2].getName(), RoomName.of("user1-user2"), users[2].getName());
        chatService.saveMessageInDb(messageDtos[3], users[0].getName(), RoomName.of("user0-user2"), users[0].getName());
        chatService.saveMessageInDb(messageDtos[4], users[1].getName(), RoomName.of("user0-user1"), users[1].getName());
        chatService.saveMessageInDb(messageDtos[5], users[1].getName(), RoomName.of("user1-user2"), users[1].getName());
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
        Assertions.assertEquals("user1", roomPrivate.getDescription());
    }

    @Test
    void whenFetchingAllRooms_forPublicDescriptionIsFromTheDb_forPrivateTheDescriptionIsTheOtherUserOfTheRoom() {
        List<RoomEntity> roomEntities = roomRepository.getAllRoomsAndLastMessageEvenIfNullInPublicRooms(loggedInUser.getName())
                .stream()
                .sorted(Comparator.comparing(roomEntity -> roomEntity.getName().value()))
                .toList();

        for (RoomEntity entity : roomEntities) {
            System.out.println(entity.getName());
        }

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
        Assertions.assertEquals("user1", roomEntities.get(1).getDescription());

        String descriptionUser0User2 = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?",
                (rs, rowNum) -> rs.getString("description"),
                "user0-user2");

        Assertions.assertNotEquals(descriptionUser0User2, roomEntities.get(2).getDescription());
        Assertions.assertEquals("user2", roomEntities.get(2).getDescription());
    }
}
