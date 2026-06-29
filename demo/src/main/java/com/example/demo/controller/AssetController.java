package com.example.demo.controller;

import com.example.demo.enums.AssetType;
import com.example.demo.models.Asset;
import com.example.demo.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class AssetController {

    private final AssetService service;

    @PostMapping("/asset")
    public Asset createAsset(@RequestBody Asset asset) {
        return service.createAsset(asset);
    }

    @GetMapping("/asset")
    public List<Asset> getAllAssets() {
        return service.getAllAssets();
    }

    @GetMapping("/asset/{id}")
    public Asset getAssetById(@PathVariable Long id) {
        return service.getAssetById(id);
    }

    @GetMapping("/asset/type")
    public ResponseEntity<List<Asset>> getAssetByType(@RequestParam AssetType type) {
        return ResponseEntity.ok(service.getAssetsByType(type));
    }

    @PutMapping("/asset/{id}")
    public Asset updateAsset(@PathVariable Long id, @RequestBody Asset asset) {
        return service.updateAsset(id, asset);
    }

    @DeleteMapping("/asset/{id}")
    public void deleteAsset(@PathVariable Long id) {
        service.deleteAsset(id);
    }

    @GetMapping("/asset/search")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'TECHNICIAN', 'ADMIN')")
    public List<Asset> searchAssets(@RequestParam(required = false) String keyword) {
        return service.searchAssets(keyword);
    }
}
