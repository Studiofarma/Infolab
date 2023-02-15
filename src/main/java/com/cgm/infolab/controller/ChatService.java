package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class ChatService {
    private  UserRepository userRepository;
    private RoomRepository roomRepository;
    private ChatMessageRepository chatMessageRepository;

    private Logger log = LoggerFactory.getLogger(ChatService.class);

    @Autowired
    public ChatService(UserRepository userRepository,
                       RoomRepository roomRepository,
                       ChatMessageRepository chatMessageRepository){
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.chatMessageRepository = chatMessageRepository;
    }
    public void ChatServiceMetodo(ChatMessage message){

        // TODO: rimuovere quando arriverà dal FE.
        // Tutto questo è per simulare il fatto che arriverà una string dal frontend, che andrà
        // poi convertita in LocalDateTime.
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
        String timestampString = new Timestamp(System.currentTimeMillis())
                .toInstant()
                .atZone(ZoneId.of("Europe/Rome"))
                .toLocalDateTime().format(formatter);

        LocalDateTime timestamp = LocalDateTime.parse(timestampString, formatter);

        UserEntity sender = userRepository.getByUsername(message.getSender()).orElseGet(() -> {
            log.info(String.format("Utente username=\"%s\" non trovato.", message.getSender()));
            return null;
        });

        String roomName = "general";
        RoomEntity room = roomRepository.getByRoomName(roomName).orElseGet(() -> {
            log.info(String.format("Room roomName=\"%s\" non trovata.", roomName));
            return null;
        });
        ChatMessageEntity messageEntity =
                ChatMessageEntity.of(sender, room, timestamp, message.getContent());

        try {
            chatMessageRepository.add(messageEntity);
        } catch (DuplicateKeyException e) {
            log.info(String.format("ChatMessageEntity id=\"%s\" già esistente nel database", messageEntity.getContent()));
        }
    }
}

