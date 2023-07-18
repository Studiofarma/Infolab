package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.DownloadDateRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class LastDownloadedDatesTests {

    @Autowired
    public TestDbHelper testDbHelper;
    @Autowired
    public ChatService chatService;
    @Autowired
    public RoomRepository roomRepository;
    @Autowired
    public DownloadDateRepository downloadDateRepository;
    @Autowired
    public JdbcTemplate jdbcTemplate;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0")),
                    UserEntity.of(Username.of("user1")),
                    UserEntity.of(Username.of("user2")),
                    UserEntity.of(Username.of("user3"))};

    public UserEntity loggedInUser = users[0]; // user0

    public RoomEntity general = RoomEntity.general();
    public RoomName user1user2RoomName = RoomName.of(users[0].getName(), users[1].getName());

    public static final LocalDateTime STARTING_TIME = LocalDateTime.of(2023, 6, 1, 1, 1, 1);

    public ChatMessageDto[] messageDtos =
            {ChatMessageDto.of("0 Hello general from user0", users[0].getName().value()),
            ChatMessageDto.of("1 Hello general from user0", users[1].getName().value()),
            ChatMessageDto.of("2 Hello general from user0", users[1].getName().value()),
            ChatMessageDto.of("3 Hello general from user0", users[1].getName().value()),

            ChatMessageDto.of("4 Visible only to user0 and user1", users[1].getName().value()),
            ChatMessageDto.of("5 Visible only to user0 and user1", users[0].getName().value()),
            };

    @BeforeAll
    void setUpAll() {
        testDbHelper.clearDbExceptForRooms();

        testDbHelper.addUsers(users);

        List<Pair<UserEntity, UserEntity>> pairs = List.of(
                Pair.of(users[0], users[1]),
                Pair.of(users[0], users[2]),
                Pair.of(users[1], users[2]),
                Pair.of(users[0], users[3])
        );

        testDbHelper.addPrivateRoomsAndSubscribeUsers(pairs);

        Long generalId = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = 'general'", (rs, rowNum) -> rs.getLong("id"));
        Long user0user1Id = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = 'user0-user1'", (rs, rowNum) -> rs.getLong("id"));

        Long user0Id = jdbcTemplate.queryForObject("select * from infolab.users where username = 'user0'", (rs, rowNum) -> rs.getLong("id"));

        // Adding messages and read dates
        testDbHelper.insertCustomMessage(0, user0Id, generalId, STARTING_TIME, messageDtos[0].getContent());
        testDbHelper.insertCustomMessage(1, user0Id, generalId, STARTING_TIME.plusSeconds(1), messageDtos[1].getContent());

        testDbHelper.insertCustomMessage(2, user0Id, user0user1Id, STARTING_TIME.plusSeconds(2), messageDtos[4].getContent());
        testDbHelper.insertCustomMessage(3, user0Id, user0user1Id, STARTING_TIME.plusSeconds(3), messageDtos[5].getContent());

        downloadDateRepository.addWhereNotDownloadedYetForUser(loggedInUser.getName(), general.getName());
        downloadDateRepository.addWhereNotDownloadedYetForUser(loggedInUser.getName(), user1user2RoomName);

        // Adding the remaining messages
        testDbHelper.insertCustomMessage(4, user0Id, generalId, STARTING_TIME.plusSeconds(4), messageDtos[2].getContent());
        testDbHelper.insertCustomMessage(5, user0Id, generalId, STARTING_TIME.plusSeconds(5), messageDtos[3].getContent());
    }

    @Test
    void whenFetchingMessages_fromGeneralAndFromPrivateRoom_lastReadDatesAreTheExpectedOnes() {
        
    }
}
