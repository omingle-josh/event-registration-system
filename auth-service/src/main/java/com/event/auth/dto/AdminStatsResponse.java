package com.event.auth.dto;

import com.event.auth.entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long registrantsCount;
    private long organizersCount;
    private long adminsCount;
}

