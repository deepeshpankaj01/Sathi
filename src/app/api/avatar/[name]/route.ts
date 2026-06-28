import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, { params }: { params: { name: string } }) {
  try {
    const { name } = params;
    
    // Map of generated images from the artifact directory
    const avatarPaths: Record<string, string> = {
      'veer': 'C:/Users/DELL/.gemini/antigravity-ide/brain/7686989f-8f49-410e-8da8-b05973207bc9/veer_avatar_1782637463151.png',
      'tara': 'C:/Users/DELL/.gemini/antigravity-ide/brain/7686989f-8f49-410e-8da8-b05973207bc9/tara_avatar_1782637473678.png'
    };

    const filePath = avatarPaths[name];
    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(filePath);
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
