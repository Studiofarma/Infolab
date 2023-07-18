package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.DownloadDateRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

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

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0")),
                    UserEntity.of(Username.of("user1")),
                    UserEntity.of(Username.of("user2")),
                    UserEntity.of(Username.of("user3"))};

    public UserEntity loggedInUser = users[0]; // user0

    public RoomEntity general = RoomEntity.general();
    public RoomName user1user2RoomName = RoomName.of(users[0].getName(), users[1].getName());

    public ChatMessageDto[] messageDtos =
            {ChatMessageDto.of("1 Hello general from user0", users[0].getName().value()),
            ChatMessageDto.of("2 Hello general from user0", users[1].getName().value()),
            ChatMessageDto.of("3 Hello general from user0", users[1].getName().value()),
            ChatMessageDto.of("4 Hello general from user0", users[1].getName().value()),

            ChatMessageDto.of("5 Visible only to user0 and user1", users[1].getName().value()),
            ChatMessageDto.of("6 Visible only to user0 and user1", users[0].getName().value()),
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

        // TODO: replace like in messages paginated api tests
        // Adding messages and read dates
        chatService.saveMessageInDb(messageDtos[0], loggedInUser.getName(), general.getName(), null);
        chatService.saveMessageInDb(messageDtos[1], loggedInUser.getName(), general.getName(), null);

        chatService.saveMessageInDb(messageDtos[1], loggedInUser.getName(), user1user2RoomName, users[0].getName());
        chatService.saveMessageInDb(messageDtos[1], loggedInUser.getName(), user1user2RoomName, users[1].getName());

        downloadDateRepository.addWhereNotDownloadedYetForUser(loggedInUser.getName(), general.getName());
        downloadDateRepository.addWhereNotDownloadedYetForUser(loggedInUser.getName(), user1user2RoomName);

        // Adding the remaining messages
        chatService.saveMessageInDb(messageDtos[2], loggedInUser.getName(), general.getName(), null);
        chatService.saveMessageInDb(messageDtos[3], loggedInUser.getName(), general.getName(), null);

    }
}
