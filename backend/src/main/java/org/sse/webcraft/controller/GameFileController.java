package org.sse.webcraft.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.sse.webcraft.mapper.GameFileMapper;
import org.sse.webcraft.model.GameFile;

import javax.servlet.http.HttpServletResponse;
import java.util.List;

@Slf4j
@RestController
public class GameFileController {

    @Autowired
    GameFileMapper gameFileMapper;

    @PostMapping("/create")
    public void createGameFile(@RequestBody GameFile gameFile,
                             HttpServletResponse response) {
        log.info(gameFile.getUsername());
        gameFileMapper.createNewGameFile(gameFile.getUsername(),
                gameFile.getFilename(),
                gameFile.getFileContent(),
                gameFile.getWorldSize());
    }

    @GetMapping("/file/{username}/{fileId}")
    public GameFile loadGameFile(@PathVariable String username,
                             @PathVariable int fileId) {
        return gameFileMapper.getGameFileByFileId(fileId);
    }

    @GetMapping("/fileList/{username}")
    public List<GameFile> loadGameFileList(@PathVariable String username) {
        return gameFileMapper.getGameFileListWithoutContent(username);
    }

    @PostMapping("/save")
    public void saveGameFile(@RequestBody GameFile gameFile) {
        gameFileMapper.updateGameFileContent(gameFile.getFileContent(),
                gameFile.getFileId());
    }

    @PostMapping("/delete/{username}/{fileId}")
    public void deleteGameFile(@PathVariable String username,
                               @PathVariable int fileId) {
        gameFileMapper.deleteGameFile(fileId);
    }
}
