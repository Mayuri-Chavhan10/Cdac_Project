package com.seedsanskriti.dto;

import com.seedsanskriti.enums.UserStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserStatusRequest {

    @NotNull
    private Long userId;

    @NotNull
    private UserStatus status;

}