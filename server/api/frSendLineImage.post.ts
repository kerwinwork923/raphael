export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // 這裡應該調用實際的後台 API
    // 目前只是模擬回應
    console.log('發送圖片訊息:', {
      ...body,
      base64String: body.base64String ? `${body.base64String.substring(0, 20)}...` : 'empty'
    });
    
    return {
      success: true,
      message: '圖片訊息發送成功',
      data: {
        ...body,
        base64String: '已處理'
      }
    };
  } catch (error) {
    console.error('發送圖片訊息錯誤:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '發送圖片訊息失敗'
    });
  }
});
