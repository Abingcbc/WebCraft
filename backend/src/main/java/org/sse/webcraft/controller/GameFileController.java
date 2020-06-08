package org.sse.webcraft.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.sse.webcraft.mapper.GameFileMapper;
import org.sse.webcraft.model.GameFile;
import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
public class GameFileController {

    @Autowired
    GameFileMapper gameFileMapper;

    @PostMapping("/create")
    public int createGameFile(@RequestBody GameFile gameFile,
                             HttpServletResponse response) {
        log.info(gameFile.getUsername());
        return gameFileMapper.createNewGameFile(gameFile);
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

    @GetMapping("/code/{fileId}")
    public String getFileShareCode(@PathVariable int fileId) {
        BASE64Encoder encoder = new BASE64Encoder();
        String result = encoder.encode(String.valueOf(fileId).getBytes());
        log.info(result);
        return result;
    }

    @GetMapping("/codeFile/{username}/{code}")
    public GameFile getFileByShareCode(@PathVariable String username,
                                       @PathVariable String code) {
        BASE64Decoder decoder = new BASE64Decoder();
        int fileId = 0;
        try {
            fileId = Integer.parseInt(new String(decoder.decodeBuffer(code)));
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        GameFile oldGameFile = gameFileMapper.getGameFileByFileId(fileId);
        oldGameFile.setUsername(username);
        gameFileMapper.createNewGameFile(oldGameFile);
        return oldGameFile;
    }
}
