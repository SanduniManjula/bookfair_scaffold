package com.example.bookfair.util;

import com.google.zxing.*;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import java.nio.file.*;

public class QrUtil {
    public static String generateQRCodeImage(String text, String path) throws Exception {
        BitMatrix bitMatrix = new MultiFormatWriter().encode(text, BarcodeFormat.QR_CODE, 200, 200);
        Path p = Paths.get(path);
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", p);
        return p.toString();
    }
}
