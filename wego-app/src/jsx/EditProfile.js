import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/EditProfile.css";

const EditProfile = () => {
    const navigate = useNavigate();

    const [profileImg, setProfileImg] = useState("");
    const [fixedNick, setFixedNick] = useState("");
    const [instagram, setInstagram] = useState("");
    const [twitter, setTwitter] = useState("");
    const [facebook, setFacebook] = useState("");
    const [bio, setBio] = useState("");
    const [selectedImageFile, setSelectedImageFile] = useState(null); // 실제 파일 저장용


    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/pages/${userId}`);
                const data = res.data;

                if (data) {
                    setProfileImg(
                        data.profile_image
                            ? `http://localhost:5000/uploads/${data.profile_image}`
                            : ""
                    );
                    setFixedNick(data.fixed_nick || "");
                    setInstagram(data.sns_instagram || "");
                    setTwitter(data.sns_twitter || "");
                    setFacebook(data.sns_facebook || "");
                    setBio(data.bio || "");
                }
            } catch (err) {
                console.error("데이터 불러오기 실패:", err);
            }
        };

        fetchData();
    }, [userId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file); // 이 파일을 서버에 전송
            setProfileImg(URL.createObjectURL(file)); // 너가 꾸며놓은 미리보기 유지
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            if (selectedImageFile) {
                formData.append("profile_image", selectedImageFile);  // ✅ multer의 upload.single('profile_image')와 일치
            }
            formData.append("fixed_nick", fixedNick);
            formData.append("sns_instagram", instagram);
            formData.append("sns_twitter", twitter);
            formData.append("sns_facebook", facebook);
            formData.append("bio", bio);

            await axios.put(`http://localhost:5000/api/pages/${userId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("프로필이 수정되었습니다!");
            navigate("/mypage");
        } catch (err) {
            console.error("저장 실패:", err);
            alert("저장 중 오류가 발생했습니다.");
        }
    };


    const handleCancel = () => {
        if (window.confirm("취소하시겠습니까? 수정한 내용이 저장되지 않습니다.")) {
            alert("취소되었습니다.");
            navigate("/mypage");
        }
    };

    return (
        <div className="edit-profile-container">
            <h2>프로필 수정</h2>
            <div className="divider-bar"></div>
            <form onSubmit={handleSubmit} className="edit-profile-form">
                <div className="form-group">
                    <label>프로필 이미지</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    <img
                        src={profileImg || ""}
                        alt="미리보기"
                        className="preview-img"
                        style={{ visibility: profileImg ? "visible" : "hidden" }}
                    />
                </div>

                <div className="divider-bar2"></div>

                <div className="form-group">
                    <label>@닉네임</label>
                    <input type="text" value={fixedNick} onChange={(e) => setFixedNick(e.target.value)} />
                </div>

                <div className="divider-bar2"></div>

                <div className="form-group">
                    <label>Instagram</label>
                    <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                </div>

                <div className="divider-bar2"></div>

                <div className="form-group">
                    <label>Twitter</label>
                    <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
                </div>

                <div className="divider-bar2"></div>

                <div className="form-group">
                    <label>Facebook</label>
                    <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                </div>

                <div className="divider-bar2"></div>

                <div className="form-group">
                    <label>소개글</label>
                    <textarea
                        rows="4"
                        placeholder="자기소개를 입력하세요"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bio-textarea"
                    />
                </div>

                <div className="form-buttons">
                    <button type="submit" className="save-btn">저장</button>
                    <button type="button" className="cancel-btn" onClick={handleCancel}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;