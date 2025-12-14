// PostForm.js
import React, { useState, useRef } from 'react';
import axios from 'axios';
import '../css/PostForm.css';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { useNavigate } from 'react-router-dom';

function PostForm({ user }) {
  const editorRef = useRef();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    category: [],
    region_type: 'domestic',
    region: '',
    thumbnailFile: null
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCategoryChange = e => {
    const { value, checked } = e.target;
    if (checked) {
      setForm({ ...form, category: [...form.category, value] });
    } else {
      setForm({ ...form, category: form.category.filter(c => c !== value) });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const htmlContent = editorRef.current.getInstance().getHTML();

      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('author', user.name);
      formData.append('category', form.category.join(','));
      formData.append('region_type', form.region_type);
      formData.append('region', form.region);
      formData.append('content', htmlContent);
      formData.append('user_id', user.id);
      formData.append('thumbnail', form.thumbnailFile);

      const res = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('게시글 등록 성공!');
      const postId = res.data.postId;
      navigate(`/post/${postId}`); // ✅ 작성 후 상세 페이지로 이동

    } catch (error) {
      console.error('게시글 등록 실패:', error);
      alert('게시글 등록 실패');
    }
  };

  const domesticRegions = ['서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시','울산광역시','세종특별자치시','경기도','강원도','충청북도','충청남도','전라북도','전라남도','경상북도','경상남도','제주특별자치도'];
  const abroadRegions = ['아시아', '유럽', '북아메리카', '남아메리카', '아프리카', '오세아니아'];

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <h2 className="form-title">나의 게시글 쓰기</h2>

      <input
        name="name"
        placeholder="제목"
        onChange={handleChange}
        value={form.name}
        className="form-input"
      />

      <input
        name="author"
        placeholder="작성자"
        value={user.name}
        readOnly
        className="form-input form-readonly"
      />

      <div className="form-group">
        <label>구분:</label>
        <label className="radio-label">
          <input
            type="radio"
            name="region_type"
            value="domestic"
            checked={form.region_type === 'domestic'}
            onChange={handleChange}
          />
          국내
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="region_type"
            value="abroad"
            checked={form.region_type === 'abroad'}
            onChange={handleChange}
          />
          해외
        </label>
      </div>

      <div className="form-group">
        <label>카테고리:</label>
        {[
          '여행', '맛집', '자연', '역사',
          '관광지', '음식점', '숙박', '축제',
          '레포츠', '교통', '쇼핑', '문화'
        ].map(c => (
          <label key={c} className="checkbox-label">
            <input
              type="checkbox"
              value={c}
              checked={form.category.includes(c)}
              onChange={handleCategoryChange}
            />
            {c}
          </label>
        ))}
      </div>
      
      <div className="form-group region-select-group">
        <label>지역 선택:</label>
        <select
          name="region"
          value={form.region}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">지역을 선택하세요</option>
          {(form.region_type === 'domestic' ? domesticRegions : abroadRegions).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="contour-bar"></div>

      <label>썸네일 이미지 (1장)</label>
      <input
        type="file"
        onChange={e => setForm({ ...form, thumbnailFile: e.target.files[0] })}
        className="form-file"
        accept="image/*"
      />

      <Editor
        ref={editorRef}
        previewStyle="vertical"
        height="500px"
        initialEditType="wysiwyg"
        useCommandShortcut={true}
        hooks={{
          addImageBlobHook: async (blob, callback) => {
            const formData = new FormData();
            formData.append('image', blob);
            try {
              const res = await axios.post('http://localhost:5000/api/posts/upload', formData);
              callback(res.data.url, '본문 이미지');
            } catch (err) {
              console.error('업로드 실패:', err);
              alert('이미지 업로드 실패');
            }
          }
        }}
      />

      <button type="submit" className="form-button">등록</button>
    </form>
  );
}

export default PostForm;
