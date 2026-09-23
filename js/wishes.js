/**
 * 12 lời chúc Trung Thu dành cho một người đặc biệt
 * Mỗi chiếc lồng đèn là một lời chúc, một điều mong ước
 * và đôi chút tâm tình dưới ánh trăng tháng Tám.
 */

export const WISHES = [
  {
    id: 1,
    category: "Trung Thu Bình An",
    title: "Một Mùa Trăng An Yên",
    badge: "🏮 Lời chúc Trung thu",
    message:
      "Lại một mùa Trung thu nữa đến rồi. Anh chẳng biết em đang đón đêm trăng này ở đâu, chỉ mong em có một buổi tối thật vui, một mùa trăng thật ấm áp và những ngày sắp tới luôn bình an, nhẹ nhàng.",
    quote:
      "Trăng lên soi một khoảng trời / Mong người năm tháng an nhiên, nhẹ lòng.",
    theme: "gold"
  },

  {
    id: 2,
    category: "Tâm Hồn An Lạc",
    title: "Ánh Trăng Bình An",
    badge: "✨ Lời chúc Bình an",
    message:
      "Mong những ngày phía trước sẽ đối xử với em thật dịu dàng. Dẫu đôi khi cuộc sống có những chuyện không như ý, mong em vẫn tìm được cho mình một khoảng bình yên để nghỉ ngơi, rồi lại mỉm cười bước tiếp.",
    quote:
      "Trăng có khi khuyết khi tròn / Chỉ mong lòng vẫn bình yên tháng ngày.",
    theme: "silver"
  },

  {
    id: 3,
    category: "Sức Khỏe & Thảnh Thơi",
    title: "Thân Tâm An Lạc",
    badge: "🌿 Lời chúc Sức khỏe",
    message:
      "Mong em luôn khỏe mạnh, ăn ngon, ngủ đủ và nhớ dành thời gian chăm sóc chính mình. Công việc có thể còn rất nhiều, nhưng đôi khi cũng nên cho bản thân một ngày thật chậm để nghỉ ngơi và tận hưởng những điều mình thích.",
    quote:
      "Gió thu khe khẽ qua hiên / Mong người mạnh khỏe, bình yên mỗi ngày.",
    theme: "teal"
  },

  {
    id: 4,
    category: "Công Việc & Cố Gắng",
    title: "Hoa Nở Sau Những Ngày Dài",
    badge: "🌱 Lời chúc Công việc",
    message:
      "Mong những cố gắng âm thầm của em rồi sẽ được đền đáp. Những việc em đang theo đuổi sẽ dần có kết quả, những ngày bận rộn sẽ trở nên xứng đáng và con đường em lựa chọn sẽ đưa em đến gần hơn với nơi mình muốn đến.",
    quote:
      "Đường dài chẳng phụ bước chân / Ngày mai rồi sẽ có phần nở hoa.",
    theme: "amber"
  },

  {
    id: 5,
    category: "Ước Mơ & Hoài Bão",
    title: "Đi Đến Nơi Mình Muốn",
    badge: "🌟 Lời chúc Ước mơ",
    message:
      "Mong em vẫn luôn có những điều để mong chờ, những nơi muốn đặt chân đến và những ước mơ khiến mình muốn cố gắng. Cuộc đời còn rất rộng, hy vọng em sẽ được nhìn thấy thật nhiều cảnh đẹp trên hành trình của riêng mình.",
    quote:
      "Trời cao còn những chân trời / Mong người cứ bước đến nơi mình tìm.",
    theme: "gold"
  },

  {
    id: 6,
    category: "Niềm Vui Giản Dị",
    title: "Cứ Vui Như Thế",
    badge: "🌻 Lời chúc Niềm vui",
    message:
      "Mong em luôn tìm thấy niềm vui từ những điều rất nhỏ: một buổi chiều đẹp, một món ăn ngon, một bản nhạc mình thích hay đơn giản là một ngày chẳng có điều gì khiến mình phải phiền lòng.",
    quote:
      "Chẳng mong ngày tháng không mưa / Chỉ mong sau đó vẫn vừa nắng lên.",
    theme: "amber"
  },

  {
    id: 7,
    category: "Gia Đình & Yêu Thương",
    title: "Một Nơi Để Trở Về",
    badge: "🏡 Lời chúc Gia đình",
    message:
      "Mong sau những ngày dài, em luôn có một nơi khiến mình muốn trở về. Có những bữa cơm ấm, những câu chuyện quen thuộc và những người chẳng cần em phải hoàn hảo vẫn luôn thương em theo cách giản dị nhất.",
    quote:
      "Đi xa mới biết đường dài / Bình yên đôi lúc chỉ là trở về.",
    theme: "red"
  },

  {
    id: 8,
    category: "Những Chuyến Đi",
    title: "Thế Giới Ngoài Kia",
    badge: "🌏 Lời chúc Hành trình",
    message:
      "Mong em được đi đến thật nhiều nơi, nhìn thấy những thành phố chưa từng thấy, những con đường chưa từng qua và lưu lại thật nhiều kỷ niệm đẹp. Mong mỗi chuyến đi đều mang về cho em một câu chuyện đáng nhớ.",
    quote:
      "Đường xa còn những mùa hoa / Mong người đi hết phong ba, thấy trời.",
    theme: "blue"
  },

  {
    id: 9,
    category: "Cuộc Gặp Gỡ",
    title: "Quẻ Thượng Thượng",
    badge: "🌕 Một chút Tâm tình",
    message:
      "Giữa rất nhiều người trên đời, có cơ hội biết đến một người đã là điều đáng quý. Anh từng đọc rằng: gặp nhau vốn đã là quẻ thượng thượng. Có lẽ vì thế, anh luôn trân trọng cuộc gặp gỡ này, bất kể sau này mỗi người sẽ đi đến đâu.",
    quote:
      "Giữa biển người rộng lớn / Gặp được nhau, đã là một điều may mắn.",
    theme: "silver"
  },

  {
    id: 10,
    category: "Những Điều Đáng Nhớ",
    title: "Một Đoạn Đường",
    badge: "🍂 Một chút Ký ức",
    message:
      "Có những người xuất hiện rất nhẹ, ban đầu chỉ là một cái tên, vài câu chuyện và những lần trò chuyện bình thường. Rồi chẳng biết từ lúc nào, những điều nhỏ bé ấy lại trở thành một phần ký ức mà khi nhớ đến, người ta vẫn có thể mỉm cười.",
    quote:
      "Có những đoạn đường không dài / Nhưng đủ để người ta nhớ rất lâu.",
    theme: "amber"
  },

  {
    id: 11,
    category: "Điều Muốn Nói",
    title: "Dưới Ánh Trăng Này",
    badge: "🍵 Một lời Tâm sự",
    message:
      "Anh từng nghĩ thời gian sẽ khiến con người quên đi rất nhiều thứ. Sau này mới hiểu, có lẽ thời gian không khiến chúng ta quên tất cả; nó chỉ âm thầm dạy chúng ta cách trân trọng những điều đã từng xuất hiện mà không nhất thiết phải giữ chúng thật chặt.",
    quote:
      "Hoa nở có mùa, trăng tròn có lúc / Điều từng đẹp đẽ, nhớ đến đã vui.",
    theme: "teal"
  },

  {
    id: 12,
    category: "Điều Ước Cuối Cùng",
    title: "Gửi Em Dưới Ánh Trăng",
    badge: "🥮 Lời chúc Cuối cùng",
    message:
      "Nếu em đã mở đến chiếc lồng đèn cuối cùng này, cảm ơn em vì đã dành thời gian đọc hết những điều anh muốn gửi. Anh chẳng có mong ước gì lớn lao, chỉ mong mùa trăng năm nay và thật nhiều mùa trăng sau nữa, em vẫn bình an, khỏe mạnh, làm được những điều mình yêu thích, đi đến những nơi mình muốn đi và gặp được thật nhiều điều tử tế trên hành trình của mình. Trung thu vui vẻ nhé!",
    quote:
      "Trăng tròn rồi lại khuyết / Chỉ mong người qua năm tháng vẫn an nhiên.",
    theme: "gold"
  }
];

export function getRandomWish(excludeId = null) {
  const pool = excludeId
    ? WISHES.filter(w => w.id !== excludeId)
    : WISHES;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getWishById(id) {
  return WISHES.find(w => w.id === id) || WISHES[0];
}