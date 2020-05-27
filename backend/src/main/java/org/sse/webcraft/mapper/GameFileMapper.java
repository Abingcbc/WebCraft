package org.sse.webcraft.mapper;

import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Component;
import org.sse.webcraft.model.GameFile;

import java.util.List;

@Component
@Mapper
public interface GameFileMapper {

    @Insert("insert into GameFile(username, fileName, createTime, updateTime, fileContent)\n" +
            "value (#{username}, #{fileName}, NOW(), NOW(), #{fileContent)};")
    int createNewGameFile(@Param("username") String username,
                          @Param("fileName") String fileName,
                          @Param("fileContent") String fileContent);

    @Select("select * from GameFile\n" +
            "where fileId = #{fileId};")
    GameFile getGameFileByFileId(@Param("fileId") int fileId);

    @Select("select fileId, username, fileName, createTime, updateTime from GameFile\n" +
            "where username = #{username};")
    List<GameFile> getGameFileListWithoutContent(@Param("username") String username);

    @Update("update GameFile\n" +
            "set fileContent = #{fileContent} and updateTime = NOW()\n" +
            "where fileId = #{fileId};")
    int updateGameFileContent(@Param("fileContent") String fileContent,
                              @Param("fileId") int fileId);

    @Delete("delete from GameFile\n" +
            "where fileId = #{fileId};")
    int deleteGameFile(@Param("fileId") int fileId);
}
