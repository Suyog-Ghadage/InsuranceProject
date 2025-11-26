package com.crud.controller;

import com.crud.dto.LoginDto;
import com.crud.entity.User;
import com.crud.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/user")
public class UserController {

    @Autowired
    private UserService service;


    @PostMapping("/save")
    public User creteUser(@RequestBody User user){

        return service.createUser(user);
    }

    @GetMapping()
    public List<User> getAllUsers(){
        return service.getAllUsers();

    }

   @GetMapping("{userId}")
    public User getUserById(@PathVariable Long userId){
        return service.getUserById(userId);
    }

    @PutMapping("/update/{userId}")
    public User updateUser(@PathVariable Long userId, @RequestBody User user){
        return service.updateUser(userId,user);

    }

    @DeleteMapping("delete/{userId}")
    public String deleteUser(@PathVariable Long userId){
        service.deleteUser(userId);
        return "user deleted successfully";

    }

}




