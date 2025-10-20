export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // 這裡應該調用實際的後台 API
    // 目前只是模擬回應
    console.log('獲取訊息:', body);
    
    // 模擬客服回應
    const mockMessages = [
      {
        type: 'service',
        content: '我了解您的問題，讓我為您處理',
        timestamp: new Date().toISOString()
      }
    ];
    
    return {
      success: true,
      message: '獲取訊息成功',
      messages: mockMessages
    };
  } catch (error) {
    console.error('獲取訊息錯誤:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '獲取訊息失敗'
    });
  }
});
