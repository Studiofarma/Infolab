package com.cgm.infolab;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SecurityTestsController {

    @GetMapping("/public/test")
    public String sayHi(){
        return "Hello";
    }

    @GetMapping("/api/test")
    public String apiTest(){
        return "apiTest requires authentication";
    }

    @GetMapping("/chat/test")
    public String chat(){
        return "chat requires authentication";
    }

    @GetMapping("/index.html")
    public String index(){
        return "ok";
    }

    @PostMapping("/chat/test")
    public String chatPost(){
        return "chatPost requires authentication";
    }

}
